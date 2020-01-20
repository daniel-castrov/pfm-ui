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

  programmingModelReady: boolean;
  pomDisplayYear: string;
  options: GridsterConfig;
  busy:boolean;
  dashboard: Array<GridsterItem>;

  constructor(private programmingModel: ProgrammingModel, private pomService: PomService, private programmingService: ProgrammingService, private dashboardService: DashboardMockService, private dialogService: DialogService) {
  }

  ngOnInit() {
    this.busy = true;
    this.pomService.getLatestPom().subscribe(
      resp => {
        this.programmingModel.pom = (resp as any).result;
        if (this.programmingModel.pom.status !== 'CLOSED') {
          this.pomDisplayYear = this.programmingModel.pom.fy.toString();
          this.pomDisplayYear = this.pomDisplayYear.substr(this.pomDisplayYear.length - 2);
          this.programmingService.getRequestsForPom(this.programmingModel.pom).subscribe(
            resp1 => {
              this.programmingModel.programs = (resp1 as any).result;
              this.busy = false;
              this.programmingModelReady = true;
            },
            error => {

            });
        }
      },
      error => {
        this.dialogService.displayDebug(error);
      });
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
