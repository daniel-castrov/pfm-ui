import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { RequestsSummaryToaWidgetComponent } from './requests-summary-toa-widget/requests-summary-toa-widget.component';
import { RequestsSummaryOrgWidgetComponent } from './requests-summary-org-widget/requests-summary-org-widget.component';
import { ProgramSummary } from '../../models/ProgramSummary';
import { GridsterConfig, GridsterItem } from 'angular-gridster2';
import { ProgrammingModel } from '../../models/ProgrammingModel';
import { PomService } from '../../services/pom-service';
import { ProgrammingService } from '../../services/programming-service';
import { DashboardMockService } from '../../../pfm-dashboard-module/services/dashboard.mock.service';
import { DialogService } from '../../../pfm-coreui/services/dialog.service';
import { ListItem } from '../../../pfm-common-models/ListItem';
import {RoleService} from '../../../services/role-service';
import { OrganizationService } from '../../../services/organization-service';
import { Role } from '../../../pfm-common-models/Role';
import { Organization } from '../../../pfm-common-models/Organization';
import { RequestsSummaryGridComponent } from './requests-summary-grid/requests-summary-grid.component';
import { MrdbService } from '../../services/mrdb-service';
import { Program } from '../../models/Program';
import { esLocale } from 'ngx-bootstrap';


@Component({
  selector: 'pfm-requests-summary',
  templateUrl: './requests-summary.component.html',
  styleUrls: ['./requests-summary.component.scss']
})
export class RequestsSummaryComponent implements OnInit {
  @ViewChild( 'toaWidetItem', { static: false } ) toaWidgetItem: ElementRef;
  @ViewChild( RequestsSummaryToaWidgetComponent, { static: false } ) toaWidget: RequestsSummaryToaWidgetComponent;

  @ViewChild( 'orgWidetItem', { static: false } ) orgWidgetItem: ElementRef;
  @ViewChild( RequestsSummaryOrgWidgetComponent, { static: false } ) orgWidget: RequestsSummaryOrgWidgetComponent;

  @ViewChild( RequestsSummaryGridComponent, {static: false}) requestsSummaryWidget: RequestsSummaryGridComponent;

  griddata: ProgramSummary[];
  availableOrgs: ListItem[];
  selectedOrg: ListItem = {id: 'Please select', name: 'Please select', value: 'Please select', isSelected: false, rawData: 'Please select'};
  programmingModelReady: boolean;
  pomDisplayYear: string;
  pomYear: number;
  options: GridsterConfig;
  addOptions: ListItem[];
  busy: boolean;
  dashboard: Array<GridsterItem>;
  showPreviousFundedProgramDialog: boolean;
  availablePrograms: ListItem[];
  orgs:Organization[];
  allPrograms: any; // used for community chart

  constructor( private programmingModel: ProgrammingModel, private pomService: PomService, private programmingService: ProgrammingService, private roleService: RoleService, private dashboardService: DashboardMockService, private dialogService: DialogService, private organizationService: OrganizationService, private mrdbService: MrdbService ) {
  }

  ngOnInit() {
    this.options = {
      minCols: 8,
      maxCols: 8,
      minRows: 8,
      maxRows: 8,
      itemResizeCallback: ( event ) => {
        if ( event.id === "toa-widget" ) {
          let w: any = this.toaWidgetItem;
          this.toaWidget.onResize( w.width, w.height );
        } else if ( event.id === "org-widget" ) {
          let w: any = this.orgWidgetItem;
          this.orgWidget.onResize( w.width, w.height );
        }

        this.saveWidgetLayout();
      },
      itemChangeCallback: () => {
        this.saveWidgetLayout();
      },
      draggable: {
        enabled: true,
      },
      resizable: {
        enabled: true,
      },
    };

    //defaults
    this.dashboard = [ { x: 0, y: 0, cols: 4, rows: 8, id: "org-widget" }, {
      x: 0,
      y: 0,
      cols: 4,
      rows: 8,
      id: "toa-widget"
    } ];

    // Populate dropdown options
    let item: ListItem = new ListItem();
    item.name = "Previously Funded Program";
    item.value = "previously-funded-program";
    item.id = "previously-funded-program";
    let item2: ListItem = new ListItem();
    item2.name = "New Program";
    item2.value = "new-program";
    item2.id = "new-program";
    this.addOptions = [ item, item2 ];

    //set up dropdown
    this.organizationService.getAll().subscribe(
        resp => {
          const orgs = ( resp as any ).result;
          const showAllOrg = new Organization();
          console.log("Organizations:"+orgs);
          this.orgs = orgs;
          showAllOrg.id = null;
          showAllOrg.abbreviation = 'Show All';
          const dropdownOptions: Organization[] = [ showAllOrg ];
          this.availableOrgs = this.toListItem(dropdownOptions.concat(orgs));
        },
        error => {
          this.dialogService.displayDebug( error );
        });

    // Get latest POM
    this.pomService.getLatestPom().subscribe(
        resp => {
          this.programmingModel.pom = (resp as any).result;
          if ( this.programmingModel.pom.status !== 'CLOSED' ) {
            this.pomDisplayYear = this.programmingModel.pom.fy.toString().substr(2);
            this.pomYear = this.programmingModel.pom.fy;
          }
        },
        error => {
          this.dialogService.displayDebug( error );
        } );

    this.roleService.getMap().subscribe(
        resp => {
          this.programmingModel.roles = resp as Map<string, Role>;
        },
        error => {
          this.dialogService.displayDebug(error);
        });
  }

  private getPreferences():void{
    this.busy = true;
    this.dashboardService.getWidgetPreferences("programming-requests-summary").subscribe(
      data => {
        this.busy = false;
        if(data){
          let list:Array<GridsterItem> = data as any;
          if(list && list.length > 0){
            this.dashboard = list;
          }
        }

      },
      error => {
        this.busy = false;
        this.dialogService.displayDebug(error);
      }
    );
  }

  private saveWidgetLayout():void{
    this.dashboardService.saveWidgetPreferences("programming-requests-summary", this.dashboard).subscribe(
      data => {
      },
      error => {
      });
  }

  // Build dropdown list items
  private toListItem(orgs:Organization[]):ListItem[]{
    let items:ListItem[] = [];
    for(let org of orgs){
      let item:ListItem = new ListItem();
      item.id = org.abbreviation;
      item.name = org.abbreviation;
      item.value = org.id;
      if (org.abbreviation === this.selectedOrg.name) {
        item.isSelected = true;
      }
      items.push(item);
    }
    return items;
  }

  // control view on selection from dropdown
  organizationSelected(organization: ListItem) {
    this.selectedOrg = organization;
    if ( this.selectedOrg.name !== 'Please select' ) {
      if ( this.programmingModel.pom.status !== 'CLOSED' ) {
        this.getPRs(this.programmingModel.pom.workspaceId, this.selectedOrg.value);
        // Get All PRs
        this.getAllPrograms();
      } else {
        this.programmingModelReady = false;
      }
    }
  }

  private async getPRs(containerId: string, organizationId): Promise<void> {
    this.busy = true;
    this.programmingModelReady = false;
    await this.programmingService.getPRsForContainer(containerId, organizationId).toPromise().then(
        resp => {
          this.programmingModel.programs = (resp as any).result;
        });
    this.programmingModelReady = true;
    this.busy = false;
  }

  handleAdd(addEvent: any) {
    if (addEvent.action === 'new-program') {
      console.log('New program Event fired');
    } else if (addEvent.action === 'previously-funded-program') {
      this.busy = true;
      this.mrdbService.getProgramsMinusPrs(this.selectedOrg.value, this.programmingModel.programs).subscribe(
          resp => {
            const programsList: ListItem[] = [];
            for ( const program of resp as Program[] ) {
              const item: ListItem = new ListItem();
              item.id = program.shortName;
              item.name = program.shortName;
              item.value = program.id;
              programsList.push( item );
            }
            this.availablePrograms = programsList;
            this.busy = false;
            this.showPreviousFundedProgramDialog = true;
          },
          error => {
          });
    }
  }

  importProgramSelected( $event: any ) {
    console.log('Import Program Selected');
  }

  onImportProgram() {
    console.log('Import Program');
  }

  onApprove():void{
    /*  remove the below code after save call working ... */
    // moved these lines of code to db save call success

    this.requestsSummaryWidget.gridData.forEach( ps => {
      ps.assignedTo = "POM Manager";
      ps.status = "Approved";
    });

    // reload or refresh the grid data after update
    this.requestsSummaryWidget.gridApi.setRowData(this.requestsSummaryWidget.gridData);
         this.griddata = this.requestsSummaryWidget.gridData;

    this.orgWidget.chartSelected(this.orgWidget.defaultChart);
    /** comment or remove the above after save call work */

    this.approveAllPRs()
  }

  approveAllPRs():void{
    this.programmingService.approvePRsForContainer(this.programmingModel.pom.workspaceId).subscribe(
      resp =>{
        this.dialogService.displayToastInfo('All program requests successfully approved.')
        this.organizationSelected(this.selectedOrg);
      },
      error => {
        let err = error as any;
        this.dialogService.displayInfo(err.error);
      });
  }

  getRespRoleId(roleStr:string):any{
    let respRoleId:string = '';
    this.programmingModel.roles.forEach(role => {
        if (role.name == roleStr){
          respRoleId = role.id;
        }
    });

    return respRoleId;
  }

  getAllPrograms(){
    this.programmingService.getPRsForContainer(this.programmingModel.pom.workspaceId, null).subscribe(
        resp => {
          this.allPrograms = (resp as any).result;
        },
        error => {
        this.dialogService.displayDebug(error);
        });
  }

  onGridDataChange(data:any):void{
    this.griddata = data;
  }

  handleOrgChartSwitch( event: any ) {
    console.log(event);
  }

  handleToaChartSwitch( event: any ) {
    console.log(event);
    if (event.action == 'Community Status') {
      this.toaChartCommunityStatus();
    }
    else if (event.action == 'Community TOA Difference') {
      this.toaChartCommunityToaDifference();
    }
    else if (event.action == 'Organization Status') {
      this.toaChartOrganizationStatus();
    }
    else if (event.action == 'Organization TOA Difference') {
      this.toaChartOrganizationToaDifference();
    }
    else if (event.action == 'Funding Line Status') {
      this.toaChartFundingLineStatus();
    }
  }

  toaChartCommunityStatus() {
    this.toaWidget.chartReady = false;
    //set chart type
    this.toaWidget.columnChart.chartType = 'ColumnChart';
    //set options
    this.toaWidget.columnChart.options = {
      title : 'Community Status',
      vAxis: {format: 'currency'},
      isStacked: true,
      legend: {position: 'top', maxLines: 2},
      seriesType: 'bars',
      series: {0: {type: 'line'}},
      colors: ['#00008B', '#008000', '#FF0000', '#FFA500', '#FFFA5C', '#88B8B4'],
      animation: {
        duration: 500,
        easing: 'out',
        startup: true
      }
    };
    let w: any = this.toaWidgetItem;
    this.toaWidget.onResize( w.width, w.height );
    //get user ID
    //todo remove hard coding of userId
    let userStr = "POM_Manager";
    let userId = '5e387ccdea2ae326ae72baa3';

    let rows:any = {};
    for (let program of this.allPrograms) {
      for (let i = 0; i < 5; i++){
        let year = this.pomYear + i;
        if(!rows[year]){
          rows[year] = {approved: 0, rejected: 0, saved: 0, outstanding: 0, notMine: 0};
        }
        // total this program
        let programTotal: number = 0;
        for ( let line of program.fundingLines ) {
          if ( !line.funds[ year ] ) {
            programTotal = programTotal + 0;
          }
          else {
            programTotal = programTotal + line.funds[ year ];
          }
        }
        // place total in correct value.
        if (program.responsibleRoleId == userId) {
          if (program.programStatus == 'APPROVED') {
            rows[year].approved = rows[year].approved + programTotal;
          }
          else if (program.programStatus == 'REJECTED') {
            rows[year].rejected = rows[year].rejected + programTotal;
          }
          else if (program.programStatus == 'SAVED') {
            rows[year].saved = rows[year].saved + programTotal;
          }
          else if (program.programStatus == 'OUTSTANDING') {
            rows[year].outstanding = rows[year].outstanding + programTotal;
          }
        }
        else {
          rows[year].notMine = rows[year].notMine + programTotal;
        }
      }
    }

    //set data header
    let data:any[] = [
      ['Fiscal Year', 'TOA', 'Approved by Me', 'Rejected by Me', 'Saved by Me', 'Outstanding for Me', 'Not in My Queue'],
    ];
    for (let i = 0; i < 5; i++) {
      let year:string = 'FY' + (this.pomYear + i - 2000);
      let toa:number = this.programmingModel.pom.communityToas[i].amount;
      let approved = rows[this.pomYear + i].approved;
      let rejected = rows[this.pomYear + i].rejected;
      let saved = rows[this.pomYear + i].saved;
      let outstanding = rows[this.pomYear + i].outstanding;
      let notMine = rows[this.pomYear + i].notMine;
      data.push([year, toa, approved, rejected, saved, outstanding, notMine]);
    }

    this.toaWidget.columnChart.dataTable = data;
    this.toaWidget.columnChart = Object.assign({}, this.toaWidget.columnChart);
    this.toaWidget.chartReady = true;
  }

  toaChartCommunityToaDifference() {
    this.toaWidget.chartReady = false;
    //set chart type
    this.toaWidget.columnChart.chartType = 'ColumnChart';
    //set options
    this.toaWidget.columnChart.options = {
      title: 'Community TOA Difference',
      vAxis: {format: 'currency'},
      legend: {position: 'none'},
      animation: {
        duration: 500,
        easing: 'out',
        startup: true
      }
    };
    let w: any = this.toaWidgetItem;
    this.toaWidget.onResize( w.width, w.height );
    //get data
    //calculate totals
    let totals:any[] = [];
    for (let program of this.allPrograms) {
      for (let i = 0; i < 5; i++){
        if (!totals[i]) {
          totals[i] = {year: (this.pomYear + i), amount: 0};
        }
        if (program.fundingLines) {
          let programTotal:number = 0;
          for (let line of program.fundingLines) {
            if (!line.funds[this.pomYear + i]) {
              programTotal = programTotal + 0;
            }
            else {
              programTotal = programTotal + line.funds[this.pomYear + i];
            }
          }
          totals[i].amount = totals[i].amount + programTotal;
        }
      }
    }
    //set data
    let data:any = [
      ['Fiscal Year', 'TOA Difference'],
    ];

    //add difference to data
    for (let i = 0; i < 5; i++) {
      let year:string = 'FY' + (totals[i].year - 2000);
      console.log("Year " + (this.pomYear + i) + ": PR Total " + totals[i].amount + " TOA Amount " + this.programmingModel.pom.communityToas[i].amount);
      let difference:number = totals[i].amount - this.programmingModel.pom.communityToas[i].amount;
      data.push([year, difference]);
    }

    this.toaWidget.columnChart.dataTable = data;
    this.toaWidget.columnChart = Object.assign({}, this.toaWidget.columnChart);
    this.toaWidget.chartReady = true;
  }

  toaChartOrganizationStatus() {
    console.log('Organization Status');
  }

  toaChartOrganizationToaDifference() {
    console.log('Organization TOA Difference');
  }

  toaChartFundingLineStatus() {
    console.log('Funding Line Status');
  }


}
