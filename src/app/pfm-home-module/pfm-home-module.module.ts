import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { PfmHomeModuleRoutingModule } from './pfm-home-module-routing.module';
import { PfmHomeModuleComponent } from './pfm-home-module.component';
import { PfmCoreuiModule } from '../pfm-coreui/pfm-coreui.module';
import { WelcomePodComponent } from './welcome-pod/welcome-pod.component';
import { LatestNewsPodComponent } from './latest-news-pod/latest-news-pod.component';
import { BaselineBreakdownPodComponent } from './baseline-breakdown-pod/baseline-breakdown-pod.component';
import { MyTodoListPodComponent } from './my-todo-list-pod/my-todo-list-pod.component';
import { MyCurrentActivityPodComponent } from './my-current-activity-pod/my-current-activity-pod.component';
import { DialogDemoPodComponent } from './dialog-demo-pod/dialog-demo-pod.component';
import { DashboardPodComponent } from './dashboard-pod/dashboard-pod.component';

@NgModule({
  declarations: [PfmHomeModuleComponent, WelcomePodComponent, LatestNewsPodComponent, BaselineBreakdownPodComponent, MyTodoListPodComponent, MyCurrentActivityPodComponent, DialogDemoPodComponent, DashboardPodComponent],
  imports: [
    CommonModule,
    PfmHomeModuleRoutingModule,
    PfmCoreuiModule
  ]
})
export class PfmHomeModuleModule { }
