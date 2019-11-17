import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { PfmHomeModuleRoutingModule } from './pfm-home-module-routing.module';
import { PfmHomeModuleComponent } from './pfm-home-module.component';
import { PfmCoreuiModule } from '../pfm-coreui/pfm-coreui.module';
import { WelcomePodComponent } from './welcome-pod/welcome-pod.component';
import { LatestNewsPodComponent } from './latest-news-pod/latest-news-pod.component';
import { DashboardPodComponent } from './dashboard-pod/dashboard-pod.component';
import { PfmDashabordModuleModule } from '../pfm-dashboard-module/pfm-dashboard-module.module';
import { PfmHomeService } from './services/pfm-home-service';
import { PfmHomeMockService } from './services/pfm-home-mock.service';
import { HttpClientModule } from '@angular/common/http';

@NgModule({
  declarations: [PfmHomeModuleComponent, WelcomePodComponent, LatestNewsPodComponent, DashboardPodComponent],
  imports: [
    CommonModule,
    HttpClientModule,
    PfmHomeModuleRoutingModule,
    PfmCoreuiModule,
    PfmDashabordModuleModule
  ],
  providers: [PfmHomeService, PfmHomeMockService]
})
export class PfmHomeModuleModule { }
