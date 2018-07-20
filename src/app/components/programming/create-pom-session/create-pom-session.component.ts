import { Component, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { forkJoin } from "rxjs/observable/forkJoin";
import { GridOptions, GridApi }  from 'ag-grid'

import { HeaderComponent } from '../../../components/header/header.component';
import { GlobalsService } from './../../../services/globals.service';
import { CommunityService } from '../../../generated/api/community.service';
import { OrganizationService } from '../../../generated/api/organization.service';
import { PBService } from '../../../generated/api/pB.service';
import { POMService } from '../../../generated/api/pOM.service';
import { EppService } from '../../../generated/api/epp.service';
import { ProgramsService } from '../../../generated/api/programs.service';
import { Community } from '../../../generated/model/community';
import { Organization } from '../../../generated/model/organization';
import { TOA } from '../../../generated/model/tOA';
import { Pom } from '../../../generated/model/pom';
import { PB } from '../../../generated/model/pB';
import { Program } from '../../../generated/model/program';

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
  private pb: PB;

  private orgMap: Map<string, string> = new Map<string, string>();
  private originalFyplus4 ={};

  private editsOk: boolean = false;
  private pomIsCreated: boolean = false;
  private pomIsOpen: boolean = false;
  private tooMuchToa: boolean = false;
  private useEpp = false;
  private submitted = false;

  constructor(private communityService: CommunityService,
    private orgsvc: OrganizationService, private pomsvc: POMService, private pbsvc: PBService,
    private eppsvc: EppService, private programsvc: ProgramsService, private router: Router,
    private globalsvc: GlobalsService ) {
  }

  private gridOptionsCommunity:GridOptions = {};
  private rowsCommunity = [];
  //private gridApiCommunity:GridApi;
  //private gridColumnApiCommunity;

  private gridOptionsOrgs:GridOptions = {};
  private rowsOrgs = [];
  //private gridApiOrgs:GridApi;
  //private gridColumnApiOrgs;

  private rowOrgsDelta = [];

  ngOnInit() {
    this.fetch();
  }

  onGridReadyCommunity(params) {
    //this.gridApiCommunity = params.api;
    //this.gridColumnApiCommunity = params.columnApi;
  }

  onGridReadyOrgs(params) {
    //this.gridApiOrgs = params.api;
    //this.gridColumnApiOrgs = params.columnApi;
  }

  initAgGrids(fy:number){
    this.gridOptionsCommunity.columnDefs=this.setAgGridColDefs("Community", fy);
    this.gridOptionsCommunity.gridAutoHeight=true;
    this.gridOptionsCommunity.enableSorting=true;
    this.gridOptionsCommunity.enableFilter=true;
    this.gridOptionsCommunity.enableColResize=true;
    this.gridOptionsCommunity.onCellValueChanged = params => this.setDeltaRow(fy); 

    this.gridOptionsOrgs.columnDefs = this.setAgGridColDefs("Organization",fy);
    this.gridOptionsOrgs.gridAutoHeight=true;
    this.gridOptionsOrgs.enableSorting=true;
    this.gridOptionsOrgs.enableFilter=true;
    this.gridOptionsOrgs.enableColResize=true;
    this.gridOptionsOrgs.onCellValueChanged = params => this.setDeltaRow(fy); 
  }

  setAgGridColDefs(column1Name:string, fy:number): any {

    let colDefs = [];

    colDefs.push( 
      { headerName: column1Name, 
        field: 'orgid', 
        width: 178,
        editable: false,
        valueGetter: params => this.orgName( params.data.orgid )
      });

    for (var i = 0; i < 5; i++) {
      colDefs.push( 
        { headerName: "FY" + (fy + i - 2000) , 
          field: (fy+ i).toString(), 
          width: 100,
          editable:true,
          valueFormatter: this.currencyFormatter
        });
    }
    colDefs.push( 
      { headerName: "FY" + (fy-2000) + "-"+ "FY" + (fy+4-2000), 
        field: 'total', 
        width: 120,
        editable: false,
        valueFormatter: this.currencyFormatter,
        valueGetter: params => this.rowTotal( params.data, fy )
      });

    return colDefs;
  }
  
  rowTotal( data, fy:number ){
    let total:number=0;
    for (var i = 0; i < 5; i++) {
      let n:number = parseInt( data[fy+i], 10 );
      total += n;
    }
    return total;
  }

  orgName( id:string ){
    if ( null == this.orgMap.get(id) ){
      return id;
    } else {
      return this.orgMap.get(id);
    }
  }

  currencyFormatter( params ) {
    let str = Math.floor( params.value )
      .toString()
      .replace( /(\d)(?=(\d{3})+(?!\d))/g, "$1," );    
    return "$ " + str;
  }

  fetch() {
    var my: CreatePomSessionComponent = this;
    this.globalsvc.user().subscribe( user => {
      forkJoin([my.communityService.getById(user.currentCommunityId),
      my.orgsvc.getByCommunityId(user.currentCommunityId),
      my.pomsvc.getByCommunityId(user.currentCommunityId),
      my.pbsvc.getLatest(user.currentCommunityId),
      my.pomsvc.getToaSamples(user.currentCommunityId)
      ]).subscribe(data => {

        my.community  = data[0].result;
        my.orgs = data[1].result;
        var poms: Pom[] = data[2].result;
        my.pb = data[3].result;
        var samplepom: Pom = data[4].result;

        my.fy = my.pb.fy + 1;
        this.orgs.forEach( org =>  my.orgMap.set( org.id, org.abbreviation ) );

        my.initAgGrids(my.fy);
        my.setInitialValuesAndEditableforAgGrid(my.fy, poms, samplepom);
        my.setDeltaRow(my.fy);

      });
    });
  }

  
  setInitialValuesAndEditableforAgGrid(fy:number, poms: Pom[], samplepom: Pom) {
    
    this.editsOk=false;

    // Is this a new POM?
    var currentPom:Pom=null;
    for (var i=0; i<poms.length; i++){      
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
      // 3a use the values from the samplepom ( the previous pb )
      this.editsOk=true;
      pomData= samplepom;
    }
    else if (this.pomIsCreated){  
      this.editsOk=true;
      pomData= currentPom;
    } else {
      this.editsOk=false;
      pomData= currentPom;
    }


    if ( this.editsOk ) {

      // BaseLine
      let row = {} 
      row["orgid"] = this.community.abbreviation+" Baseline";

      samplepom.communityToas.forEach((toa: TOA) => {
        row[toa.year] = toa.amount;
      });
      for (var i = 0; i < 5; i++) {
        if ( row[ fy+i ] == undefined ) row[ fy+i ] = 0;
      }
      this.rowsCommunity.push(row);

      // Community Toas
      row = {}
      row["orgid"] = this.community.abbreviation+" TOA";
      pomData.communityToas.forEach((toa: TOA) => {
        row[toa.year] = toa.amount +2 ;
      });
      for (var i = 0; i < 5; i++) {
        if ( row[ fy+i ] == undefined ) row[ fy+i ] = 0;
      }
      this.rowsCommunity.push(row);
    
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
          for (var i = 0; i < 5; i++) {
            if ( roww[ fy+i ] == undefined ) roww[ fy+i ] = 0;
          }
        });
    }

    this.rowsOrgs.forEach( rowww => {
        this.originalFyplus4[rowww["orgid"]] = rowww[fy+4];
    });

  } 

  setDeltaRow(fy:number) {

    let deltaRow = {};
    for (var i = 0; i < 5; i++) {
      deltaRow[fy+i] = this.rowsCommunity[1][fy+ i];
    }
      this.rowsOrgs.forEach( row => {
    for (var i = 0; i < 5; i++) {
        deltaRow[fy+i] = deltaRow[fy+i] - row[fy+i]
      }
     });
    this.rowOrgsDelta = [];
    deltaRow["orgid"] = "Delta";
    this.rowOrgsDelta = [deltaRow];
  }

  private useEppData() {

    // This only effects FY + 4 Data
    if (this.useEpp == true) {
      // show the FY + 4 data from the epp data
      this.getEppData( this.fy+4 );
    } else {
      // replace all values in fy+4 with the original fy+4 data
      this.rowsCommunity[1][this.fy+4] = this.originalFyplus4[this.community.id];

      this.rowsOrgs.forEach( row =>  {
        row[this.fy+4] = this.originalFyplus4[row["orgid"]] 
        console.log( row[this.fy+4] + " -- " + this.originalFyplus4[row["orgid"]] );
      }); 
      
      
      this.setDeltaRow(this.fy);
    }
    
  }

  private getEppData(eppYear:number) {

    forkJoin([
      this.eppsvc.getValid(this.community.id, this.pb.id),
      this.programsvc.getProgramsByCommunity(this.community.id),
    ]).subscribe(data => {

      let eppData = data[0].result;
      let programs: Program[] = data[1].result;

      let eppOrgToa = {};
      this.orgs.forEach(org => {
        eppOrgToa[org.id] = 0;
      });

      eppData.forEach( eppDataRow => {
        let amount = 0;
        if (eppDataRow.fySums[eppYear]) {
          amount = eppDataRow.fySums[eppYear];
        }
        let index = programs.findIndex(program => program.shortName === eppDataRow.shortName);
        if (index > 0) {
          eppOrgToa[programs[index].organization] += amount;
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
      this.rowsCommunity[1][this.fy + 4] = total;
      this.setDeltaRow(this.fy);
    });

  }

  submitNewPom() {    

    this.submitted=true;
    var transfer:Pom = this.buildTransfer();
    
    console.log(transfer);

    this.pomsvc.createPom( this.community.id, this.fy, transfer, this.pb.id, this.useEpp ).subscribe(
      (data) => {
        if (data.result) {
          this.router.navigate(['/home']);
        }
      });
  }

  updatePom() {

    this.submitted=true;
    var transfer:Pom = this.buildTransfer();

    this.pomsvc.updateCurrentPom( this.community.id, transfer, this.useEpp ).subscribe(
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
        { year: this.fy+i, amount: parseInt(this.rowsCommunity[1][this.fy+i],10) }

        
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

}
