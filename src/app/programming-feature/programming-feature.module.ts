import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

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

@NgModule({
  declarations: [ProgrammingFeatureComponent, CreateProgrammingComponent, OpenProgrammingComponent, LockProgrammingComponent, CloseProgrammingComponent, ToaComponent, RequestsComponent, RequestsApprovalComponent, UfrRequestsComponent, UfrRequestsApprovalComponent, TotalAppropriationPriorityComponent, WorkSpaceManagementComponent],
  imports: [
    CommonModule,
    HttpClientModule,
    PfmCoreuiModule,
    PfmSecureFileuploadModule,
    ProgrammingFeatureRoutingModule
  ],
  providers: [{provide: ProgrammingService, useClass: ProgrammingServiceMock}]
})
export class ProgrammingFeatureModule { }
