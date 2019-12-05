import { AfterViewInit, Component, ComponentFactoryResolver, EventEmitter, Input, OnDestroy, OnInit, Output, QueryList, ViewChild, ViewChildren, ViewContainerRef } from '@angular/core';
import { DialogService } from '../../pfm-coreui/services/dialog.service';
import { DashboardService } from '../services/dashboard.service';
import { DashboardMockService } from '../services/dashboard.mock.service';
import { WidgetPreference } from '../models/WidgetPreference';
import { Draggable, GridsterConfig, GridsterItem } from 'angular-gridster2';
import { Resizable } from 'angular-gridster2/lib/gridsterConfigS.interface';

@Component({
  selector: 'pfm-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit, OnDestroy{

  @Input() showDialog:boolean;
  @Output() hideDialog:EventEmitter<boolean> = new EventEmitter<boolean>();

  options: GridsterConfig;
  dashboard: Array<GridsterItem>;

  busy:boolean;
  availableWidgetList:any[];
  selectedCardType:string;

  constructor(private dashboardService:DashboardMockService, private dialogService:DialogService) {
    this.availableWidgetList = [{id: 'w1', title: 'Mission Funding Money', selected: false},{id: 'w2', title: 'Mission Funding Priority', selected: false}, {id: 'w3', title: 'POM Phase Funding', selected: false},{id: 'w4', title: 'PR Status', selected: false}];
  }

  removeWidget(item:any):void{
    this.dialogService.displayConfirmation("Are you sure you want to remove this widget?", "Delete Confirmation",
      ()=>{
        let widget = this.availableWidgetList.find(obj => obj.id == item.id);
        let dashboardItem = this.dashboard.find(obj => obj.id == item.id);

        widget.selected = false;
        this.dashboard.splice(this.dashboard.indexOf(dashboardItem), 1);
        this.saveWidgetLayout();
      },
      ()=>{
        console.log("cancel");
      });
  }

  onItemDropped(event:any):void{
  }

  onDialogClose():void{
    this.resetPreferences();
    this.saveWidgetLayout();
    this.hideDialog.emit(true);
  }

  onCardSelected(type:string):void{
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

  saveWidgetLayout():void{
    this.dashboardService.saveWidgetPreferences(this.dashboard).subscribe(
      data => {
      },
      error => {

      });
  }

  ngOnInit() {
    this.options = {
      minCols: 4,
      maxCols: 4,
      minRows: 4,
      maxRows: 4,
      itemResizeCallback: ()=>{
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
    this.getPreferences();
  }

  private processAvailableWidgets():void{
    for(let item of this.dashboard){
      let widget = this.availableWidgetList.find(obj => obj.id == item.id);
      widget.selected = true;
    }
  }

  private resetPreferences():void{
    for(let item of this.availableWidgetList){
      let dashboardItem = this.dashboard.find(obj => obj.id == item.id);

      if(item.selected && !dashboardItem){
        this.dashboard.push(item);
      }
      else if(!item.selected && dashboardItem){
        this.dashboard.splice(this.dashboard.indexOf(dashboardItem), 1);
      }
    }
  }

  private getPreferences():void{
    this.busy = true;
    this.dashboardService.getWidgetPreferences().subscribe(
      data => {
        this.busy = false;
        this.dashboard = data as any;
        this.processAvailableWidgets();
      },
      error => {
        this.busy = false;
        this.dialogService.displayDebug(error);
      }
    );
  }

  ngOnDestroy(){
    this.saveWidgetLayout();
  }

}
