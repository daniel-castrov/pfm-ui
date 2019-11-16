import { AfterViewInit, Component, ComponentFactoryResolver, EventEmitter, Input, OnInit, Output, QueryList, ViewChild, ViewChildren, ViewContainerRef } from '@angular/core';
import { CdkDragDrop, CdkDropList, moveItemInArray, transferArrayItem } from '@angular/cdk/drag-drop';
import { DialogService } from '../../pfm-coreui/services/dialog.service';

@Component({
  selector: 'pfm-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent{

  @Input() showDialog:boolean;
  @Output() hideDialog:EventEmitter<boolean> = new EventEmitter<boolean>();

  widgetComponentsList:string[];
  widgetList:any[];

  selectedCardType:string;

  constructor() {
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

  drop(event: CdkDragDrop<string[]>) {
    if (event.previousContainer === event.container) {
      moveItemInArray(event.container.data, event.previousIndex, event.currentIndex);
    }
    else {
      transferArrayItem(event.previousContainer.data,
        event.container.data,
        event.previousIndex,
        event.currentIndex);
    }
  }

}
