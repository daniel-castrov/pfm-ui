import {Component, OnInit, ViewChild} from '@angular/core';
import {Router} from '@angular/router';
import {forkJoin} from "rxjs/observable/forkJoin";
import {GridOptions} from 'ag-grid';
import {HeaderComponent} from '../../header/header.component';
import {UserUtils} from '../../../services/user.utils';
import {NumericCellEditor} from './numeric-celleditior.component';
import {ProgramAndPrService} from '../../../services/program-and-pr.service';
import {
  Budget,
  Community,
  CommunityService,
  EppService,
  Organization,
  OrganizationService,
  Pom,
  POMService,
  Program,
  TOA
} from '../../../generated';
import {Notify} from "../../../utils/Notify";
import {CurrentPhase} from "../../../services/current-phase.service";

@Component({
  selector: 'app-create-pom-session',
  templateUrl: './create-pom-session.component.html',
  styleUrls: ['./create-pom-session.component.scss']
})

export class CreatePomSessionComponent implements OnInit {

  @ViewChild(HeaderComponent) header;

  private fy: number;
  private community: Community;
  private orgs: Organization[];
  private budget: Budget;

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

  constructor( private communityService: CommunityService,
               private orgsvc: OrganizationService,
               private pomsvc: POMService,
               private currentPhase: CurrentPhase,
               private eppsvc: EppService,
               private router: Router,
               private globalsvc: UserUtils,
               private programAndPrService: ProgramAndPrService ) {}

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
        cellRenderer: params => '<strong>'+params.value+'</strong>',
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
      if ( params.data.orgid === this.community.abbreviation+' TOA' )  return true; 
      else return false;
    } else return params.node.rowPinned ? false : true;  
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
        this.currentPhase.budget(),
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
        this.budget = data[3];
        var samplepom: Pom = data[4].result;
        this.fy = this.budget.fy + 1;
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

    let pomData;

    if ( null == currentPom ){
      // Use the values from the samplepom ( the previous budget )
      pomData= samplepom;
    } else {
      pomData= currentPom;
    }

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
    row["orgid"] = this.community.abbreviation+" TOA";
    pomData.communityToas.forEach((toa: TOA) => {
      row[toa.year] = toa.amount;
    });
    for (i = 0; i < 5; i++) {
      if ( row[ fy+i ] == undefined ) row[ fy+i ] = 0;
    }
    this.rowsCommunity = [row];

    // Org TOAs
    Object.keys(pomData.orgToas).forEach(key => {
      var toamap: Map<number, number> = new Map<number, number>();

      row = {};
      let total = 0;
      row["orgid"] = key ;
        pomData.orgToas[key].forEach( (toa:TOA) => {
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
      this.programAndPrService.programsByCommunity(this.community.id),
      this.programAndPrService.programRequests(this.budget.id),
    ]).subscribe(data => {

      let alleppData:any[] = data[0].result;
      let programs: Program[] = data[1];
      let prs:Program[] = data[2];
      
      let fls:string[] = [];
      prs.forEach( pr => {
        if ( pr.type != "GENERIC" ){
          pr.fundingLines.forEach( fl => {
            let flId:string = pr.shortName + fl.appropriation + fl.baOrBlin + fl.item + fl.opAgency;
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
        let index = programs.findIndex(program => program.shortName === epp.shortName);
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
    });
  }

  private submitNewPom() {

    this.submitted=true;
    var transfer:Pom = this.buildTransfer();

    this.pomsvc.createPom( this.community.id, this.fy, transfer, this.budget.finalPbId, this.useEpp  ).subscribe(
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

}
