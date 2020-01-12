import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import {TabsModule} from 'ngx-bootstrap/tabs';
import { ProgrammingFeatureRoutingModule } from './programming-feature-routing.module';
import { ProgrammingFeatureComponent } from './programming-feature.component';
import { CreateProgrammingComponent } from './create-programming/create-programming.component';
import { PfmCoreuiModule } from '../pfm-coreui/pfm-coreui.module';
import { ProgrammingService } from '../../app/programming-feature/services/programming-service';
import { ProgrammingServiceMock } from '../../app/programming-feature/services/programming-service-mock';
import { HttpClientModule } from '@angular/common/http';
import { PfmSecureFileuploadModule } from '../pfm-secure-fileupload/pfm-secure-fileupload.module';
import { OpenProgrammingComponent } from './open-programming/open-programming.component';
import { LockProgrammingComponent } from './lock-programming/lock-programming.component';
import { CloseProgrammingComponent } from './close-programming/close-programming.component';
import { ToaComponent } from './toa/toa.component';
import { RequestsComponent } from './requests/requests.component';
import { RequestsApprovalComponent } from './requests-approval/requests-approval.component';
import { UfrRequestsComponent } from './ufr-requests/ufr-requests.component';
import { UfrRequestsApprovalComponent } from './ufr-requests-approval/ufr-requests-approval.component';
import { TotalAppropriationPriorityComponent } from './total-appropriation-priority/total-appropriation-priority.component';
import { WorkSpaceManagementComponent } from './work-space-management/work-space-management.component';
import { RequestsSummaryGridComponent } from './requests/requests-summary-grid/requests-summary-grid.component';
import { RequestsSummaryOrgWidgetComponent } from './requests/requests-summary-org-widget/requests-summary-org-widget.component';
import { RequestsSummaryToaWidgetComponent } from './requests/requests-summary-toa-widget/requests-summary-toa-widget.component';
import { GridsterModule } from 'angular-gridster2';
import { Ng2GoogleChartsModule } from 'ng2-google-charts';
import { ProgrammingServicesImpl } from './services/programming-services-impl.service';


@NgModule({
  declarations: [ProgrammingFeatureComponent, CreateProgrammingComponent, OpenProgrammingComponent, LockProgrammingComponent, CloseProgrammingComponent, ToaComponent, RequestsComponent, RequestsApprovalComponent, UfrRequestsComponent, UfrRequestsApprovalComponent, TotalAppropriationPriorityComponent, WorkSpaceManagementComponent, RequestsSummaryGridComponent, RequestsSummaryOrgWidgetComponent, RequestsSummaryToaWidgetComponent],
  imports: [
    CommonModule,
    HttpClientModule,
    GridsterModule,
    Ng2GoogleChartsModule,
    PfmCoreuiModule,
    PfmSecureFileuploadModule,
    TabsModule.forRoot(),
    ProgrammingFeatureRoutingModule
  ],
  providers: [{provide: ProgrammingService, useClass: ProgrammingServiceMock}]
})
export class ProgrammingFeatureModule { }
