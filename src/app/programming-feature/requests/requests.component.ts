import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { GridsterConfig, GridsterItem } from 'angular-gridster2';
import { DashboardMockService } from '../../pfm-dashboard-module/services/dashboard.mock.service';
import { DialogService } from '../../pfm-coreui/services/dialog.service';
import { ProgrammingService } from '../services/programming-service';
import { FormatterUtil } from '../../util/formatterUtil';
import { RequestsSummaryToaWidgetComponent } from './requests-summary-toa-widget/requests-summary-toa-widget.component';
import { SecureDownloadComponent } from '../../pfm-secure-filedownload/secure-download/secure-download.component';
import { RequestsSummaryOrgWidgetComponent } from './requests-summary-org-widget/requests-summary-org-widget.component';
import { DropdownComponent } from '../../pfm-coreui/form-inputs/dropdown/dropdown.component';
import { ProgramRequestForPOM } from '../models/ProgramRequestForPOM';

@Component({
  selector: 'pfm-programming',
  templateUrl: './requests.component.html',
  styleUrls: ['./requests.component.scss']
})
export class RequestsComponent implements OnInit {
  @ViewChild('toaWidetItem',  {static: false}) toaWidgetItem: ElementRef;
  @ViewChild(RequestsSummaryToaWidgetComponent,  {static: false}) toaWidget: RequestsSummaryToaWidgetComponent

  @ViewChild('orgWidetItem',  {static: false}) orgWidgetItem: ElementRef;
  @ViewChild(RequestsSummaryOrgWidgetComponent,  {static: false}) orgWidget: RequestsSummaryOrgWidgetComponent

  griddata:ProgramRequestForPOM[];

  options: GridsterConfig;
  busy:boolean;
  dashboard: Array<GridsterItem>;

  constructor(private programmingService:ProgrammingService, private dashboardService:DashboardMockService, private dialogService:DialogService) { }

  ngOnInit() {
    this.busy = true;

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
    this.dashboard = [{ x: 0, y: 0, cols: 3, rows: 3, id: "org-widget" }, { x: 0, y: 0, cols: 3, rows: 3, id: "toa-widget" }];

    this.programmingService.getRequestsForPom().subscribe(
      resp => {
        this.griddata = resp as any;
        this.getPreferences();
      },
      error =>{
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
}
