import {
  Component,
  ViewChildren,
  QueryList,
  AfterViewInit,
  ComponentFactoryResolver,
  ViewChild,
  ViewContainerRef
} from '@angular/core';

import {CdkDropList, CdkDragDrop, CdkDragEnter, moveItemInArray} from '@angular/cdk/drag-drop';
import {DemoWidgetPrStatusComponent} from "./widgets/demo-widget-pr-status/demo-widget-pr-status.component";

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss'],
})
export class DashboardComponent implements AfterViewInit{

  drops: CdkDropList[];

  constructor(private componentFactoryResolver: ComponentFactoryResolver) {
  }


  ngAfterViewInit(): void {}

}
