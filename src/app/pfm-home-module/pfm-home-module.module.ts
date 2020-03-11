import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CalendarModule } from 'primeng/calendar';
import { CKEditorModule } from '@ckeditor/ckeditor5-angular';
import { BsDatepickerModule, TimepickerModule } from 'ngx-bootstrap';
import { FormsModule } from '@angular/forms';

import { PfmHomeModuleRoutingModule } from './pfm-home-module-routing.module';
import { PfmHomeModuleComponent } from './pfm-home-module.component';
import { PfmCoreuiModule } from '../pfm-coreui/pfm-coreui.module';
import { WelcomePodComponent } from './welcome-pod/welcome-pod.component';
import { LatestNewsPodComponent } from './latest-news-pod/latest-news-pod.component';
import { DashboardPodComponent } from './dashboard-pod/dashboard-pod.component';
import { PfmDashabordModuleModule } from '../pfm-dashboard-module/pfm-dashboard-module.module';
import { PfmHomeService } from './services/pfm-home-service';
import { HttpClientModule } from '@angular/common/http';
import { PfmHomeServicesImpl } from './services/pfm-home-service-impl.service';
import { PfmHomeMockService } from './services/pfm-home-mock.service';

@NgModule({
  declarations: [PfmHomeModuleComponent, WelcomePodComponent, LatestNewsPodComponent, DashboardPodComponent],
  imports: [
    CommonModule,
    FormsModule,
    HttpClientModule,
    PfmHomeModuleRoutingModule,
    PfmCoreuiModule,
    PfmDashabordModuleModule,
    CKEditorModule,
    BsDatepickerModule.forRoot(),
    TimepickerModule.forRoot(),
    CalendarModule
  ],
  providers: [{ provide: PfmHomeService, useClass: PfmHomeServicesImpl }, PfmHomeMockService]
})
export class PfmHomeModuleModule { }
