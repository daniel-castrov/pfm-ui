import { Component, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { forkJoin } from "rxjs/observable/forkJoin";
import { GridOptions }  from 'ag-grid'

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

  private toas: Map<number, number> = new Map<number, number>();
  private orgtoas: Map<string, Map<number, number>> = new Map<string, Map<number, number>>();
  private originalFyplus4 ={};
  private pb: PB;
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

  // AG-GRID --- A Community grid and an Orgs grid

  private gridOptionsCommunity:GridOptions = {};
  private gridApiCommunity;
  private gridColumnApiCommunity;

  private gridOptionsOrgs:GridOptions = {};
  private gridApiOrg;
  private gridColumnApiOrg;


  ngOnInit() {
    this.fetch();
  }

  onGridReadyCommunity(params) {
    this.gridApiCommunity = params.api;
    this.gridColumnApiCommunity = params.columnApi;
  }

  onGridReadyOrg(params) {
    this.gridApiOrg = params.api;
    this.gridColumnApiOrg = params.columnApi;
  }

  initAgGrids(fy:number){
    this.gridOptionsCommunity.columnDefs=this.setAgGridColDefs("Community", fy);
    this.gridOptionsCommunity.gridAutoHeight=true;
    this.gridOptionsCommunity.enableSorting=true;
    this.gridOptionsCommunity.enableFilter=true;
    this.gridOptionsCommunity.enableColResize=true;
    this.gridOptionsCommunity.rowData=[];
    this.gridOptionsCommunity.onCellValueChanged = params => this.setDeltaRow(fy); 

    this.gridOptionsOrgs.columnDefs = this.setAgGridColDefs("Organization",fy);
    this.gridOptionsOrgs.gridAutoHeight=true;
    this.gridOptionsOrgs.enableSorting=true;
    this.gridOptionsOrgs.enableFilter=true;
    this.gridOptionsOrgs.enableColResize=true;
    this.gridOptionsOrgs.rowData=[];
    this.gridOptionsOrgs.onCellValueChanged = params => this.setDeltaRow(fy); 
 
  }

  setAgGridColDefs(column1Name:string, fy:number): any {

    let colDefs = [];

    colDefs.push( 
      { headerName: column1Name, 
        field: 'name', 
        width: 178,
        editable: false,
        pinnedRowCellRenderer: ""
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
    this.setDeltaRow(fy);
    return total;
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

        my.toas.clear();
        my.orgtoas.clear();

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
      row["name"] = this.community.abbreviation+" Baseline";

      samplepom.communityToas.forEach((toa: TOA) => {
        row[toa.year] = toa.amount;
      });
      for (var i = 0; i < 5; i++) {
        if ( row[ fy+i ] == undefined ) row[ fy+i ] = 0;
      }
      this.gridOptionsCommunity.rowData=[row];

      // Community Toas
      row = {}
      row["name"] = this.community.abbreviation+" TOA";
      pomData.communityToas.forEach((toa: TOA) => {
        row[toa.year] = toa.amount -2;
      });
      for (var i = 0; i < 5; i++) {
        if ( row[ fy+i ] == undefined ) row[ fy+i ] = 0;
      }
      this.gridOptionsCommunity.rowData.push( row );
    
      // Org TOAs
      var orgMap: Map<string, string> = new Map<string, string>();
      this.orgs.forEach( org =>  orgMap.set( org.id, org.abbreviation ) );

      Object.keys(pomData.orgToas).forEach(key => {
        var toamap: Map<number, number> = new Map<number, number>();

        row = {};
        let total = 0;
        row["name"] = orgMap.get( key );
          pomData.orgToas[key].forEach( (toa:TOA) => {
            row[toa.year] = toa.amount;
          });
        this.gridOptionsOrgs.rowData.push( row );
        });
        this.gridOptionsOrgs.rowData.forEach( roww => {
          for (var i = 0; i < 5; i++) {
            if ( roww[ fy+i ] == undefined ) roww[ fy+i ] = 0;
          }
        });
    }
  } 

  setDeltaRow(fy:number) {

    console.log( "Fired" )

    let deltaRow = {};
    for (var i = 0; i < 5; i++) {
      deltaRow[fy+i] = this.gridOptionsCommunity.rowData[1][fy+ i];
    }

    this.gridOptionsOrgs.rowData.forEach( row => {
      for (var i = 0; i < 5; i++) {
        deltaRow[fy+i] = deltaRow[fy+i] - row[fy+i]
      }
     });

    this.gridOptionsOrgs.pinnedBottomRowData=[];
    deltaRow["name"] = "Delta";
    this.gridOptionsOrgs.pinnedBottomRowData.push( deltaRow );
  }


  editfield(event, id, fy) {
    var val: number = Number.parseInt(event.target.innerText.replace(/,/g, ''));
    if (val > 99999999) {
      val = 99999999;
    }

    if (id === this.community.id) {
      this.toas.set(Number.parseInt(fy), val);
    }
    else {
      this.orgtoas.get(id).set(Number.parseInt(fy), val);
    }

    this.setDeltaRow(fy);
  }

 

  loadFY4fromEpp() {

    if (this.useEpp == true) {
      // show the FY + 4 data from the epp data
      this.getYear5ToasFromEpp( this.fy+4 );
    } else {
      // replace all values in fy+4 with the original fy+4 data
      this.orgs.forEach(org => this.orgtoas.get(org.id).set(this.fy+4, this.originalFyplus4[org.id] ));
      this.toas.set(this.fy+4, this.originalFyplus4[this.community.id]);
      this.setDeltaRow(this.fy);
    }
    
  }

  getYear5ToasFromEpp(eppYear:number) {

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
        this.orgtoas.get(org.id).set(this.fy + 4, eppOrgToa[org.id]);
        total += eppOrgToa[org.id];
      });
      this.toas.set(this.fy + 4, total);
      this.setDeltaRow(this.fy);
    });

  }

  submitNewPom() {    

    var my: CreatePomSessionComponent = this;
    my.submitted=true;
    var transfer:Pom = my.buildTransfer();

    this.pomsvc.createPom( this.community.id, this.fy, transfer, my.pb.id, this.useEpp ).subscribe(
      (data) => {
        if (data.result) {
          my.router.navigate(['/home']);
        }
      });
  }

  updatePom() {

    var my: CreatePomSessionComponent = this;
    my.submitted=true;
    var transfer:Pom = my.buildTransfer();

    this.pomsvc.updateCurrentPom( this.community.id, transfer, this.useEpp ).subscribe(
      (data) => {
        if (data.result) {
          my.router.navigate(['/home']);
        }
      });
  }

  buildTransfer():Pom{

    var my: CreatePomSessionComponent = this;
    var toas: TOA[] = [];
    my.toas.forEach(function (amt, yr) {
      var t: TOA = {
        year: yr,
        amount: amt
      };
      toas.push(t);
    });

    var otoas: { [key: string]: TOA[]; } = {};
    my.orgtoas.forEach(function (toamap, orgid) {
      var tlist: TOA[] = [];
      my.orgtoas.get(orgid).forEach(function (amt, yr) {
        tlist.push({ year: yr, amount: amt });
      });
      otoas[orgid] = tlist;
    });

    var transfer: Pom = {
      communityToas: toas,
      orgToas: otoas,
      fy: this.fy
    };

    return transfer;
  }





  // ngOnInit() {

    // //jQuery for editing table
    // var $TABLE = $('#toa2', '#toa2');
    // var $BTN = $('#export-btn');
    // var $EXPORT = $('#export');

    // $('.table-add').click(function () {
    //   var $clone = $TABLE.find('tr.hide').clone(true).removeClass('hide table-line');
    //   $TABLE.find('table').append($clone);
    // });

    // $('.table-remove').click(function () {
    //   $(this).parents('tr').detach();
    // });

    // $('.table-up').click(function () {
    //   var $row = $(this).parents('tr');
    //   if ($row.index() === 1) return; // Don't go above the header
    //   $row.prev().before($row.get(0));
    // });

    // $('.table-down').click(function () {
    //   var $row = $(this).parents('tr');
    //   $row.next().after($row.get(0));
    // });

    // // A few jQuery helpers for exporting only
    // jQuery.fn.pop = [].pop;
    // jQuery.fn.shift = [].shift;

    // $BTN.click(function () {
    //   var $rows = $TABLE.find('tr:not(:hidden)');
    //   var headers = [];
    //   var data = [];

    //   // Get the headers (add special header logic here)
    //   $($rows.shift()).find('th:not(:empty)').each(function () {
    //     headers.push($(this).text().toLowerCase());
    //   });

    //   // Turn all existing rows into a loopable array
    //   $rows.each(function () {
    //     var $td = $(this).find('td');
    //     var h = {};

    //     // Use the headers from earlier to name our hash keys
    //     headers.forEach(function (header, i) {
    //       h[header] = $td.eq(i).text();
    //     });

    //     data.push(h);
    //   });

    //   // Output the result
    //   $EXPORT.text(JSON.stringify(data));
    // });

  //   this.fetch();

  // }


 // setInitialValuesAndEditable(poms: Pom[], samplepom: Pom) {
  //   var my: CreatePomSessionComponent = this;

  //   // set everything to 0, just to be safe
  //   my.editsOk=false;
  //   for (var i = 0; i < 5; i++) {
  //     my.toas.set(my.fy + i, 0);
  //   }
  //   my.orgs.forEach(function (org) {
  //     var tszeros: Map<number, number> = new Map<number, number>();
  //     for (var i = 0; i < 5; i++) {
  //       tszeros.set(my.fy + i, 0);
  //     }
  //     my.orgtoas.set(org.id, tszeros);
  //   });
  //   for (var i = 0; i < 5; i++) {
  //     my.baseline.set(my.fy + i, 0);
  //   }

  //   // 2 Always set the baseline from the previous pb
  //   samplepom.communityToas.forEach((toa: TOA) => {
  //     my.baseline.set(toa.year, toa.amount);
  //   });

  //   // Do we have a pom or are we creating a new one from the latest PB?
  //   var currentPom:Pom=null;
  //   for (var i=0; i<poms.length; i++){      
  //     if ( poms[i].status === "CREATED" ){
  //       this.pomIsCreated=true;
  //       currentPom=poms[i];
  //       break;
  //     } 
  //     if ( poms[i].status === "OPEN" ){
  //       this.pomIsOpen=true;
  //       currentPom=poms[i];
  //       break;
  //     } 
  //   }

  //   if ( null == currentPom ){
  //     // 3a use the values from the samplepom ( the previous pb )
  //     my.editsOk=true;

  //     samplepom.communityToas.forEach((toa: TOA) => {
  //       my.toas.set(toa.year, toa.amount);
  //       //my.baseline.set(toa.year, toa.amount);
  //     });

  //     Object.keys(samplepom.orgToas).forEach(orgid => {
  //       samplepom.orgToas[orgid].forEach(toa => {
  //         my.orgtoas.get(orgid).set(toa.year, toa.amount);
  //       });
  //     });
  //   }
  //   else if (this.pomIsCreated){
  //     // 3b User the values from the currentPom
  //     my.editsOk=true;

  //     currentPom.communityToas.forEach((toa) => {
  //       my.toas.set(toa.year, toa.amount);
  //     });

  //     Object.keys(currentPom.orgToas).forEach(key => {
  //       var toamap: Map<number, number> = new Map<number, number>();
  //       currentPom.orgToas[key].forEach(toa => {
  //         toamap.set(toa.year, toa.amount);
  //       });
  //       my.orgtoas.set(key, toamap);
  //     });
  //   }
  //   else {
  //     my.editsOk=false;
  //   }


  //   // Remember the original fy+4 data to allow toggling between orig and epp
  //   my.orgs.forEach(org => {
  //     my.originalFyplus4[org.id] = my.orgtoas.get(org.id).get(my.fy+4);
  //   });
  //   my.originalFyplus4[my.community.id] = my.toas.get(my.fy+4);

  // }


  // setTotals() {
  //   var my: CreatePomSessionComponent = this;

  //   // update our running totals
  //   my.orgsums.clear();
  //   my.yeardiffs.clear();
  //   my.tooMuchToa = false;

  //   var amt = 0;
  //   my.toas.forEach(function (val, year) {
  //     if (year >= my.fy) {
  //       amt += val;
  //       my.yeardiffs.set(year, val);

  //       if (!my.orgsums.has(my.community.id)) {
  //         my.orgsums.set(my.community.id, 0);
  //       }
  //       my.orgsums.set(my.community.id, my.orgsums.get(my.community.id) + val);
  //     }
  //   });

  //   amt = 0;
  //   my.orgtoas.forEach(function (toas, orgid) {
  //     my.orgsums.set(orgid, 0);
  //     toas.forEach(function (amt, year) {
  //       if (year >= my.fy) {
  //         my.yeardiffs.set(year, my.yeardiffs.get(year) - amt);
  //         my.orgsums.set(orgid, my.orgsums.get(orgid) + amt);

  //         if (my.yeardiffs.get(year) < 0) {
  //           my.tooMuchToa = true;
  //         }
  //       }
  //     });
  //   });

  // }



}
