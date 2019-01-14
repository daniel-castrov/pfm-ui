import { Component, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { forkJoin } from "rxjs/observable/forkJoin";
import { GridOptions, ColDef }  from 'ag-grid';
import { HeaderComponent } from '../../header/header.component';
import { UserUtils } from '../../../services/user.utils';
import { NumericCellEditor } from './numeric-celleditior.component';
import { ProgramRequestWithFullName, ProgramWithFullName, WithFullNameService } from '../../../services/with-full-name.service';
import { ChartSelectEvent, GoogleChartComponent, ChartMouseOutEvent, ChartMouseOverEvent } from 'ng2-google-charts';
import { 
  Community,
  Organization,
  TOA,
  Pom,
  PB,
  CommunityService,
  OrganizationService,
  PBService,
  POMService,
  EppService
} from '../../../generated';
import {Notify} from "../../../utils/Notify";
import { AgGridNg2 } from 'ag-grid-angular';

@Component({
  selector: 'app-create-pom-session',
  templateUrl: './create-pom-session.component.html',
  styleUrls: ['./create-pom-session.component.scss']
})

export class CreatePomSessionComponent implements OnInit {

  @ViewChild(HeaderComponent) header: HeaderComponent;
  @ViewChild(GoogleChartComponent) comchart: GoogleChartComponent;
  @ViewChild('agGridOrgs') agGridOrgs: AgGridNg2;

  private fy: number;
  private community: Community;
  private orgs: Organization[];
  private pb: PB;

  private orgMap: Map<string, string>;
  private originalFyplus4;

  private pomIsCreated: boolean;
  private pomIsOpen: boolean;
  private tooMuchToa: boolean;
  private useEpp: boolean;
  private submitted:boolean;

  private gridOptionsCommunity:GridOptions;
  private rowsCommunity;
  private pinnedRowCommunityBaseline;

  private gridOptionsOrgs:GridOptions;
  private rowsOrgs;
  private pinnedRowOrgsDelta;
  private menuTabs = ['filterMenuTab'];

  private chartdata;
  private subchartdata;
  private pomData;
  private chartLockEvent;

  constructor(
    private communityService: CommunityService, private orgsvc: OrganizationService,
    private pomsvc: POMService, private pbsvc: PBService, private eppsvc: EppService,
    private router: Router, private globalsvc: UserUtils,
    private withFullNameService: WithFullNameService) {
    
    this.chartdata = {
      chartType: 'ColumnChart',
      dataTable: [],
      options: { 'title': 'Community TOA' },
    };
  }

  ngOnInit() {
    this.gridOptionsCommunity = {};
    this.gridOptionsOrgs = {};
    this.myinit();
  }

  // Initialize both grids
  private initGrids(fy:number){

    this.gridOptionsCommunity = {
      columnDefs : this.setAgGridColDefs("Community", fy),
      gridAutoHeight : true,
      suppressDragLeaveHidesColumns:true,
      suppressMovableColumns: true,
      onCellValueChanged : params => this.setDeltaRow(fy),
      frameworkComponents: {
        numericCellEditor: NumericCellEditor
      }
    }

    this.gridOptionsOrgs = {
      columnDefs : this.setAgGridColDefs("Organization", fy),
      gridAutoHeight : true,
      suppressDragLeaveHidesColumns:true,
      suppressMovableColumns: true,
      onCellValueChanged : params => this.setDeltaRow(fy),
      frameworkComponents: {
        numericCellEditor: NumericCellEditor
      }
    }
  }

  // Set similar column definitions for both grids
  private setAgGridColDefs(column1Name:string, fy:number): any {

    let colDefs = [];

    colDefs.push(
      { headerName: column1Name,
        suppressMenu: true,
        field: 'orgid',
        width: 178,
        editable: false,
        valueGetter: params => this.orgName( params.data.orgid ),
        cellRenderer: params => '<b>'+params.value+'</b>',
        cellClassRules: {
        'ag-cell-footer-sum': params => {
          return params.data.orgid == 'Delta'
        }
      }
    });

    for (var i = 0; i < 5; i++) {
      colDefs.push(
        { headerName: "FY" + (fy + i - 2000) ,
          type: "numericColumn",
          suppressMenu: true,
          field: (fy+ i).toString(),
          width: 100,
          editable: params => this.shouldEdit(params),
          cellRenderer: params => this.negativeNumberRenderer(params),
          cellEditor: "numericCellEditor",
          cellClassRules: {
          'ag-cell-edit': params =>this.shouldEdit(params),
          'ag-cell-footer-sum': params => {
            return params.data.orgid == 'Delta'
          }
        }
      });
    }
    colDefs.push(
      { headerName: "FY" + (fy-2000) + "-"+ "FY" + (fy+4-2000),
        type: "numericColumn",
        suppressMenu: true,
        field: 'total',
        width: 120,
        editable: false,
        valueGetter: params => this.rowTotal( params.data, fy ),
        cellRenderer: params => '<i>'+this.negativeNumberRenderer(params)+'</i>',
        cellClassRules: {
        'ag-cell-footer-sum': params => {
          return params.data.orgid == 'Delta'
        }
      }
    });

    return colDefs;
  }

  // A valueGetter for totaling a row
  private rowTotal( data, fy:number ){
    let total:number=0;
    for (var i = 0; i < 5; i++) {
      total += parseInt(data[fy+i],10);
    }
    return total;
  }

  // A valueGetter for looking up an org name
  private orgName( id:string ){
    if ( null == this.orgMap.get(id) ){
      return id;
    } else {
      return this.orgMap.get(id);
    }
  }

  // a sinple CellRenderrer for negative numbers
  private negativeNumberRenderer( params ){

    if ( params.value < 0 ){
      return '<span style="color: red;">' + this.formatCurrency( params ) + '</span>';
    } else {
      return this.formatCurrency( params );
    }
  }

  // a callback for determining if a ROW is editable
  private shouldEdit ( params ){
    if ( this.pomIsOpen ) {
      if (params.data.orgid === this.community.abbreviation + ' TOA') {
        return true;
      }
      else {
        return false;
      }
    }

    return params.node.rowPinned ? false : true;  
  }

  // helper for currency formatting
  private formatCurrency( params ) {
    let str = Math.floor( params.value )
      .toString()
      .replace( /(\d)(?=(\d{3})+(?!\d))/g, "$1," );
    return "$ " + str;
  }

  // Init and fetch all
  private myinit() {

    this.globalsvc.user().subscribe( user => {
      forkJoin([this.communityService.getById(user.currentCommunityId),
        this.orgsvc.getByCommunityId(user.currentCommunityId),
        this.pomsvc.getByCommunityId(user.currentCommunityId),
        this.pbsvc.getLatest(user.currentCommunityId),
        this.pomsvc.getToaSamples(user.currentCommunityId)
      ]).subscribe(data => {

        this.rowsCommunity = [];
        this.pinnedRowCommunityBaseline = [];
        this.orgs = [];
        this.rowsOrgs = [];
        this.pinnedRowOrgsDelta = [];
        this.orgMap = new Map<string, string>();
        this.originalFyplus4 ={};
        this.pomIsCreated = false;
        this.pomIsOpen = false;
        this.tooMuchToa = false;
        this.useEpp = false;
        this.submitted = false;

        this.community  = data[0].result;
        this.orgs = data[1].result;
        var poms: Pom[] = data[2].result;
        this.pb = data[3].result;
        var samplepom: Pom = data[4].result;
        this.fy = this.pb.fy + 1;
        this.orgs.forEach( org => this.orgMap.set( org.id, org.abbreviation ) );

        this.initGrids(this.fy);
        this.setInitialGridValues(this.fy, poms, samplepom);
        this.setDeltaRow(this.fy);
      });
    });
  }

  private setInitialGridValues(fy:number, poms: Pom[], samplepom: Pom) {

    let i:number;

    // Is this a new POM?
    var currentPom:Pom=null;
    for (i=0; i<poms.length; i++){
      if ( poms[i].status === "CREATED" ){
        this.pomIsCreated=true;
        currentPom=poms[i];
        break;
      }
      if ( poms[i].status === "OPEN" ){
        this.pomIsOpen=true;
        currentPom=poms[i];
        break;
      }
    }

    this.pomData = (null == currentPom
      // Use the values from the samplepom ( the previous pb )
      ? samplepom
      : currentPom );

    // BaseLine
    let row = {}
    row["orgid"] = this.community.abbreviation+" Baseline";

    samplepom.communityToas.forEach((toa: TOA) => {
      row[toa.year] = toa.amount;
    });
    for (i = 0; i < 5; i++) {
      if ( row[ fy+i ] == undefined ) row[ fy+i ] = 0;
    }
    this.pinnedRowCommunityBaseline = [row];

    // Community Toas
    row = {}
    row["orgid"] = this.community.abbreviation + " TOA";
    this.pomData.communityToas.forEach((toa: TOA) => {
      row[toa.year] = toa.amount;
    });
    for (i = 0; i < 5; i++) {
      if ( row[ fy+i ] == undefined ) row[ fy+i ] = 0;
    }
    this.rowsCommunity = [row];

    // Org TOAs
    Object.keys(this.pomData.orgToas).forEach(key => {
      var toamap: Map<number, number> = new Map<number, number>();

      row = {};
      let total = 0;
      row["orgid"] = key ;
        this.pomData.orgToas[key].forEach( (toa:TOA) => {
          row[toa.year] = toa.amount;
        });
      this.rowsOrgs.push(row);
      });
      this.rowsOrgs.forEach( roww => {
      for (i = 0; i < 5; i++) {
        if ( roww[ fy+i ] == undefined ) {
          roww[ fy+i ] = 0;
        }

      }
    });
  

    this.originalFyplus4[this.community.id]  =   this.rowsCommunity[0][this.fy+4];
    this.rowsOrgs.forEach( rowww => {
        this.originalFyplus4[rowww["orgid"]] = rowww[fy+4];
    });

    this.resetCharts();
  }

  // Compute and set the bottom 'pinned' row.
  private setDeltaRow(fy:number) {

    this.tooMuchToa = false;

    let i:number;
    let deltaRow = {};
    for (i = 0; i < 5; i++) {
      deltaRow[fy+i] =  this.rowsCommunity[0][fy+ i];
    }

    this.rowsOrgs.forEach( row => {
      for (i = 0; i < 5; i++) {
        deltaRow[fy+i] = deltaRow[fy+i] - row[fy+i]
        if (deltaRow[fy+i] <0 ){
          this.tooMuchToa = true;
        }
      }
     });
    if (this.tooMuchToa) {
      Notify.error('Organizational TOA(s) exceeds Community TOA');
    }
    this.pinnedRowOrgsDelta = [];
    deltaRow["orgid"] = "Delta";
    this.pinnedRowOrgsDelta = [deltaRow];

    this.resetCharts();
  }

  private useEppData() {

    this.useEpp = !this.useEpp;

    // This only effects FY + 4 Data
    if (this.useEpp == true) {
      // show the FY + 4 data from the epp data
      this.getEppData();
    } else {
      // replace all values in fy+4 with the original fy+4 data
      this.rowsCommunity[0][this.fy+4] = this.originalFyplus4[this.community.id];

      this.rowsOrgs.forEach( row =>  {
        row[this.fy+4] = this.originalFyplus4[row["orgid"]]
      });
      this.setDeltaRow(this.fy);

      // refresh both grids
      this.gridOptionsCommunity.api.refreshCells();
      this.gridOptionsOrgs.api.refreshCells();

    }
  }

  private getEppData() {

    forkJoin([
      this.eppsvc.getByCommunityId(this.community.id),
      this.withFullNameService.programsByCommunity(this.community.id),
      this.withFullNameService.programRequestsWithFullNamesDerivedFromArchivalData(this.pb.id),
    ]).subscribe(data => {

      let alleppData:any[] = data[0].result;
      let programs: ProgramWithFullName[] = data[1];
      let prs:ProgramRequestWithFullName[] = data[2];
      
      let fls:string[] = [];
      prs.forEach( pr => {
        if ( pr.type != "GENERIC" ){
          pr.fundingLines.forEach( fl => {
            let flId:string = pr.fullname + fl.appropriation + fl.baOrBlin + fl.item + fl.opAgency;
            fls.push( flId );
          });
        }
      });
      
      let eppData:any[] = [];
      let eppYear:number = this.fy+4;
      alleppData.forEach( epp => {
        let eppId:string = epp.shortName + epp.appropriation + epp.blin + epp.item + epp.opAgency;
        if ( epp.fySums[eppYear] > 0 && fls.includes(eppId) ){
          eppData.push(epp);
        }
      });

      let eppOrgToa = {};
      this.orgs.forEach(org => {
        eppOrgToa[org.id] = 0;
      });

      eppData.forEach( epp => {
        let amount = 0;
        if (epp.fySums[eppYear]) {
          amount = epp.fySums[eppYear];
        }
        let index = programs.findIndex(program => program.fullname === epp.shortName);
        if (index > 0) {
          eppOrgToa[ programs[index].organizationId ] += amount;
        }
      });

      let total = 0;
      this.orgs.forEach(org => {
        for (var j = 0; j < this.rowsOrgs.length; j++){
          let row = this.rowsOrgs[j];
          if ( row["orgid"] == org.id ){
            row[this.fy + 4] =  eppOrgToa[org.id];
            total += eppOrgToa[org.id];
            break;
          }
        }
      });
      this.rowsCommunity[0][this.fy + 4] = total;
      this.setDeltaRow(this.fy);

      // refresh both grids
      this.gridOptionsCommunity.api.refreshCells();
      this.gridOptionsOrgs.api.refreshCells();

      this.resetCharts();
    });
  }

  private submitNewPom() {

    this.submitted=true;
    var transfer:Pom = this.buildTransfer();

    this.pomsvc.createPom( this.community.id, this.fy, transfer, this.pb.id, this.useEpp  ).subscribe(
      (data) => {
        if (data.result) {
          this.router.navigate(['/home']);
        }
      });
  }

  private reload(){
    this.myinit();
  }

  private updatePom() {

    this.submitted=true;
    var transfer:Pom = this.buildTransfer();

    this.pomsvc.updateCurrentPom( this.community.id, transfer ).subscribe(
      (data) => {
        if (data.result) {
          this.router.navigate(['/home']);
        }
      });
  }

  private buildTransfer(): Pom {

    var toas: TOA[] = [];
    for (var i=0; i < 5; i++){
      toas.push(
        { year: this.fy+i, amount: this.rowsCommunity[0][this.fy+i] }
      );
    }

    var otoas: { [key: string]: TOA[]; } = {};
    this.rowsOrgs.forEach( row => {
      var tlist: TOA[] = [];
      for (var i=0; i < 5; i++){
        tlist.push(
          { year: this.fy+i, amount: row[ this.fy+i ]  }
        );
      }
      otoas[row["orgid"]] = tlist;
    });

    var transfer: Pom = {
      communityToas: toas,
      orgToas: otoas,
      fy: this.fy
    };
    return transfer;
  }

  onGridReadyCom(params) {
    params.api.sizeColumnsToFit();
    window.addEventListener("resize", function() {
      setTimeout(() => {
        params.api.sizeColumnsToFit();
      });
    });
  }

  onGridReadyOrgs(params) {
    params.api.sizeColumnsToFit();
    window.addEventListener("resize", function() {
      setTimeout(() => {
        params.api.sizeColumnsToFit();
      });
    });
  }


  resetCharts() {
    var yeartoas: Map<number, number> = new Map<number, number>();

    for (var i = 0; i < 5; i++) {
      yeartoas.set(this.fy + i, this.rowsCommunity[0][this.fy + i]);
    }

    var charty: [any[]] = [['Year', 'Baseline', 'TOA', { role: 'annotation' }]];
    for (var i = 0; i < 5; i++) {
      var newamt = yeartoas.get(this.fy + i);
      if ('string' === typeof newamt) {
        newamt = Number.parseInt(newamt);
      }

      var baseamt: number = this.pinnedRowCommunityBaseline[0][this.fy + i];

      charty.push([(this.fy + i).toString(), baseamt, newamt, newamt]);
    }

    this.chartdata = {
      chartType: 'ColumnChart',
      dataTable: charty,
      options: {
        title: 'Community TOA'
      }
    };

    if (this.chartLockEvent) {
      this.comchart.wrapper.getChart().setSelection
      this.createSubchart(this.chartLockEvent);
    }
  }

  select(event: ChartSelectEvent) {
    if ('deselect' === event.message) {
      delete this.subchartdata;
      delete this.chartLockEvent;
    }
    else if ('select' === event.message) {
      this.chartLockEvent = {
        position: {
          row: event.row,
          column: event.column
        }
      };
    }
  }

  resetOrgTableColumns(myfy: number) {
    for (var i = 0; i < 5; i++) {
      var year: number = this.fy + i;
      var colkey: string = year.toString();

      var visi: boolean = (myfy < 0 || year === myfy);
      this.agGridOrgs.columnApi.setColumnVisible(colkey, visi);
      
      if (visi) {
        this.agGridOrgs.columnApi.setColumnWidth(colkey, 100);
      }
    }
    this.agGridOrgs.api.sizeColumnsToFit();
  }

  createSubchart(event: ChartMouseOverEvent) {
    var myfy: number = this.fy + event.position.row;
    var isbaseline: boolean = (1 === event.position.column);
    this.generateSubchart(myfy, isbaseline);
    this.resetOrgTableColumns(myfy);
  }

  removeSubchart(event: ChartMouseOutEvent) {
    if (this.chartLockEvent) {
      this.createSubchart(this.chartLockEvent);
    }
    else {
      delete this.subchartdata;
      delete this.chartLockEvent;
      this.resetOrgTableColumns(-1);
    }
  }

  generateSubchart(myfy: number, isbaseline: boolean) {
    var subdata: [any[]] = [['Organization', myfy + ' TOA', { role: 'annotation' }]];
    var totalalloc: number = 0;
    this.rowsOrgs.forEach(orgdata => {
      var orgname: string = this.orgMap.get(orgdata.orgid);
      var amt: number = (isbaseline
        ? this.pomData.orgToas[orgdata.orgid].filter(x => x.year === myfy).map(x => x.amount)[0]
        : orgdata[myfy]);
      if ('string' === typeof amt) {
        amt = Number.parseInt(amt);
      }
      totalalloc += amt;
      subdata.push([orgname, amt, amt]);
    });

    // add an "unallocated" pie wedge, too
    var maxtoa: number = this.chartdata.dataTable[myfy - this.fy + 1][isbaseline ? 1 : 2];
    subdata.push(['Unallocated', maxtoa - totalalloc, maxtoa - totalalloc]);

    this.subchartdata = {
      chartType: 'PieChart',
      dataTable: subdata,
      options: {
        title: `FY${myfy - 2000} Organizational TOA Breakdown` + (isbaseline ? ' (Baseline)' : '')
      }
    };
  }

  chartready() {
    //this.addAction(this.comchart.wrapper.getChart());
  }
}
