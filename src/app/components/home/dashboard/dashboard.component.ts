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
import {DemoWidgetOneComponent} from "./widgets/demo-widget-one/demo-widget-one.component";
import {DemoWidgetTwoComponent} from "./widgets/demo-widget-two/demo-widget-two.component";
import {DemoWidgetThreeComponent} from "./widgets/demo-widget-three/demo-widget-three.component";
import {DemoWidgetFourComponent} from "./widgets/demo-widget-four/demo-widget-four.component";
import {DemoWidgetPOMPhaseFundingComponent} from "./widgets/demo-widget-pom-phase-funding/demo-widget-pom-phase-funding.component";
import {DemoWidgetPrStatusComponent} from "./widgets/demo-widget-pr-status/demo-widget-pr-status.component";

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss'],
})
export class DashboardComponent implements AfterViewInit{

  @ViewChild('dash', { read: ViewContainerRef }) dash: ViewContainerRef;
  @ViewChildren(CdkDropList) dropsQuery: QueryList<CdkDropList>;
  drops: CdkDropList[];

  constructor(private componentFactoryResolver: ComponentFactoryResolver) {
  }

  loadComponents() {
    //If uncommented, method just loads and adds a the widgets below to the dash component.  Just for testing.

    // const viewContainerRef = this.dash;
    //
    // const componentFactoryTwo = this.componentFactoryResolver.resolveComponentFactory(DemoWidgetTwoComponent);
    // const componentRefTwo = viewContainerRef.createComponent(componentFactoryTwo);
    //
    // const componentFactoryOne = this.componentFactoryResolver.resolveComponentFactory(DemoWidgetOneComponent);
    // const componentRefOne = viewContainerRef.createComponent(componentFactoryOne);

    //viewContainerRef.clear();
    // https://stackoverflow.com/questions/50429163/create-component-dynamically-with-parameters#50429222
    // (<AdComponent>componentRef.instance).data = adItem.data;
  }

  ngAfterViewInit(): void {

    this.loadComponents();

  }

  public addComponents(widgets: any[]) {

    console.log(widgets);
    for (var i = 0; i < widgets.length; i++) {
      console.log(widgets[i]);
      if(widgets[i].selected) {
        let viewContainerRef = this.dash;
        let componentFactory = this.componentFactoryResolver.resolveComponentFactory(this.getWidget(widgets[i].id));
        let componentRefOne = viewContainerRef.createComponent(componentFactory);
      }
    }
  }

  private getWidget(id: string) {
    //console.log(id);
    if(id === 'asdf1') {
      return DemoWidgetOneComponent;
    }
    if(id === 'asdf2') {
      return DemoWidgetTwoComponent;
    }
    if(id === 'asdf3') {
      console.log(id);
      return DemoWidgetThreeComponent;
    }
    if(id === 'asdf4') {
      return DemoWidgetFourComponent;
    }
    if(id === 'asdf5'){
      return DemoWidgetPOMPhaseFundingComponent;
    }
    if(id === 'asdf6'){
      return DemoWidgetPrStatusComponent;
    }
    //TODO - should do some kind of error condition here, or ?  This mechanism should be revisited.
    return null;
  }

}
