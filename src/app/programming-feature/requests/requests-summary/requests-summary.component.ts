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
import { add } from 'ngx-bootstrap/chronos';

@Component({
  selector: 'pfm-requests-summary',
  templateUrl: './requests-summary.component.html',
  styleUrls: ['./requests-summary.component.scss']
})
export class RequestsSummaryComponent implements OnInit {
  @ViewChild('toaWidetItem',  {static: false}) toaWidgetItem: ElementRef;
  @ViewChild(RequestsSummaryToaWidgetComponent,  {static: false}) toaWidget: RequestsSummaryToaWidgetComponent;

  @ViewChild('orgWidetItem',  {static: false}) orgWidgetItem: ElementRef;
  @ViewChild(RequestsSummaryOrgWidgetComponent,  {static: false}) orgWidget: RequestsSummaryOrgWidgetComponent;

  griddata:ProgramSummary[];
  availableOrgs: ListItem[];
  selectedOrg: string;
  programmingModelReady: boolean;
  pomDisplayYear: string;
  options: GridsterConfig;
  addOptions:ListItem[];
  busy:boolean;
  dashboard: Array<GridsterItem>;
  showPreviousFundedProgramDialog: boolean;
  availablePrograms: ListItem[];

  constructor(private programmingModel: ProgrammingModel, private pomService: PomService, private programmingService: ProgrammingService, private roleService: RoleService, private dashboardService: DashboardMockService, private dialogService: DialogService, private organizationService: OrganizationService) {
  }

  ngOnInit() {
    this.options = {
      minCols: 8,
      maxCols: 8,
      minRows: 8,
      maxRows: 8,
      itemResizeCallback: (event)=>{
        if(event.id === "toa-widget"){
          let w:any = this.toaWidgetItem;
          this.toaWidget.onResize(w.width, w.height);
        }
        else if(event.id === "org-widget"){
          let w:any = this.orgWidgetItem;
          this.orgWidget.onResize(w.width, w.height);
        }

        this.saveWidgetLayout();
      },
      itemChangeCallback: ()=>{
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
    this.dashboard = [{ x: 0, y: 0, cols: 4, rows: 8, id: "org-widget" }, { x: 0, y: 0, cols: 4, rows: 8, id: "toa-widget" }];

    // Populate dropdown options
    let item:ListItem = new ListItem();
    item.name = "Previously Funded Program";
    item.value = "previously-funded-program";
    item.id = "previously-funded-program";
    let item2:ListItem = new ListItem();
    item2.name = "New Program";
    item2.value = "new-program";
    item2.id = "new-program";
    this.addOptions = [item, item2];

    //set up dropdown
    this.organizationService.getAll().subscribe(
        resp => {
          let orgs = (resp as any).result;
          let dropdownOptions: string[] = ['Show All'];
          for (let org of orgs) {
            dropdownOptions.push(org.abbreviation);
          }
          this.availableOrgs = this.toListItem(dropdownOptions);
          this.selectedOrg = 'Please select';
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

  // Needed for Dropdown
  private toListItem(orgs:string[]):ListItem[]{
    let items:ListItem[] = [];
    for(let org of orgs){
      let item:ListItem = new ListItem();
      item.id = org;
      item.name = org;
      item.value = org;
      if (org === this.selectedOrg) {
        item.isSelected = true;
      }
      items.push(item);
    }
    return items;
  }

  // control view on selection from dropdown
  organizationSelected(organization: ListItem){
    if (organization.id != 'Please select') {
      this.busy = true;
      this.pomService.getLatestPom().subscribe(
          pomResp => {
            this.programmingModel.pom = (pomResp as any).result;
            if (this.programmingModel.pom.status !== 'CLOSED') {
              this.pomDisplayYear = this.programmingModel.pom.fy.toString().substr(2);
              this.programmingService.getPRsForContainer(this.programmingModel.pom.workspaceId).subscribe(
                  programResp => {
                    this.programmingModel.programs = (programResp as any).result;
                    this.roleService.getMap().subscribe(
                        roleResp => {
                          this.programmingModel.roles = roleResp as Map<string, Role>;
                          this.programmingModelReady = true;
                          this.busy = false;
                        }
                    );
                  },
                  error => {
                  });
            }
          },
          error => {
            this.dialogService.displayDebug(error);
          });
    }
    else {
      this.programmingModelReady = false;
    }
  }

  handleAdd(addEvent: any){
    if (addEvent.id == 'new-program') {
      console.log('New program Event fired');
    }
    else if (addEvent.id == 'previously-funded-program') {
      this.showPreviousFundedProgramDialog = true;
    }
  }

  importProgramSelected( $event: any ) {
    console.log('Import Program Selected');
  }

  onImportProgram() {
    console.log('Import Program');
  }
}
