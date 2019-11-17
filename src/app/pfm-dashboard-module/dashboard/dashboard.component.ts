import { AfterViewInit, Component, ComponentFactoryResolver, EventEmitter, Input, OnInit, Output, QueryList, ViewChild, ViewChildren, ViewContainerRef } from '@angular/core';
import { DialogService } from '../../pfm-coreui/services/dialog.service';
import { DashboardService } from '../services/dashboard.service';
import { DashboardMockService } from '../services/dashboard.mock.service';
import { WidgetPreference } from '../models/WidgetPreference';

@Component({
  selector: 'pfm-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit{

  @Input() showDialog:boolean;
  @Output() hideDialog:EventEmitter<boolean> = new EventEmitter<boolean>();

  busy:boolean;
  widgetComponentsList:string[];
  widgetList:any[];
  selectedCardType:string;

  widgetPreferences:WidgetPreference[];

  constructor(private dashboardService:DashboardMockService, private dialogService:DialogService) {
    this.widgetComponentsList = [];
    this.widgetList = [{id: 'w1', title: 'Mission Funding Money', selected: false},{id: 'w2', title: 'Mission Funding Priority', selected: false}, {id: 'w3', title: 'POM Phase Funding', selected: false},{id: 'w4', title: 'PR Status', selected: false}];
  }

  onDialogClose():void{
    this.hideDialog.emit(true);
  }

  onCardSelected(type:string):void{
    console.info(type);
    if(this.selectedCardType && this.selectedCardType === type){
      this.selectedCardType = undefined;
    }
    else if(this.selectedCardType){
      this.selectedCardType = type;
    }
    else{
      this.selectedCardType = type;
    }
  }

  ngOnInit() {
    this.busy = true;
    this.dashboardService.getWidgetPreferences().subscribe(
      data => {
        this.busy = false;
        this.widgetPreferences = (data as any).result;
        this.dialogService.displayToastInfo("got dashboard widget data");
      },
      error => {
        this.busy = false;
        this.dialogService.displayDebug(error);
      }
    );
  }

}
