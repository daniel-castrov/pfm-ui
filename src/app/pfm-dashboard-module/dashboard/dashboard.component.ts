import { AfterViewInit, Component, ComponentFactoryResolver, OnInit, QueryList, ViewChild, ViewChildren, ViewContainerRef } from '@angular/core';
import { CdkDragDrop, CdkDropList, moveItemInArray, transferArrayItem } from '@angular/cdk/drag-drop';
import { DialogService } from '../../pfm-coreui/services/dialog.service';

@Component({
  selector: 'pfm-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent{

  showDialog:boolean;

  widgetComponentsList:string[];
  widgetList:string[];

  constructor(private componentFactoryResolver: ComponentFactoryResolver, private dialog:DialogService) {
    this.widgetComponentsList = [];
    this.widgetList = ['Mission Funding Money','Mission Funding Priority', 'POM Phase Funding','PR Status'];
  }



  drop(event: CdkDragDrop<string[]>) {
    if (event.previousContainer === event.container) {
      moveItemInArray(event.container.data, event.previousIndex, event.currentIndex);
    } else {
      transferArrayItem(event.previousContainer.data,
        event.container.data,
        event.previousIndex,
        event.currentIndex);
    }
  }

}
