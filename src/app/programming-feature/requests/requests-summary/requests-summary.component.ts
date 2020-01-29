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
  options: GridsterConfig;
  addOptions: ListItem[];
  busy: boolean;
  dashboard: Array<GridsterItem>;
  showPreviousFundedProgramDialog: boolean;
  availablePrograms: ListItem[];

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
    if (addEvent.id === 'new-program') {
      console.log('New program Event fired');
    } else if (addEvent.id === 'previously-funded-program') {
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

  onApprove(){
    
    this.requestsSummaryWidget.gridData.forEach( ps => { 
      ps.assignedTo = "POM Manager";
      ps.status = "Approved";
    });    

    // reload or refresh the grid data after update
    this.requestsSummaryWidget.gridApi.setRowData(this.requestsSummaryWidget.gridData);
    this.dialogService.displayToastInfo("All program requests successfully approved.")

  }

}
