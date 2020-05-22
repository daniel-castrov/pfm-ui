import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { ProgrammingFeatureComponent } from './programming-feature.component';
import { AuthGuard } from '../pfm-auth-module/services/auth-guard';
import { CreateProgrammingComponent } from './create-programming/create-programming.component';
import { RequestsComponent } from './requests/requests.component';
import { OpenProgrammingComponent } from './open-programming/open-programming.component';
import { LockProgrammingComponent } from './lock-programming/lock-programming.component';
import { CloseProgrammingComponent } from './close-programming/close-programming.component';
import { RequestsApprovalComponent } from './requests-approval/requests-approval.component';
import { UfrRequestsComponent } from './ufr-requests/ufr-requests.component';
import { ToaComponent } from './toa/toa.component';
import { TotalAppropriationPriorityComponent } from './total-appropriation-priority/total-appropriation-priority.component';
import { WorkSpaceManagementComponent } from './work-space-management/work-space-management.component';
import { RequestsSummaryComponent } from './requests/requests-summary/requests-summary.component';
import { RequestsDetailsComponent } from './requests/requests-details/requests-details.component';
import { CompareWorkSpacesComponent } from './work-space-management/compare-work-spaces/compare-work-spaces.component';

const routes: Routes = [
  {
    path: '',
    component: ProgrammingFeatureComponent,
    canActivate: [AuthGuard],
    children: [
      { path: 'create-programming', component: CreateProgrammingComponent, canActivate: [AuthGuard] },
      { path: 'close-programming', component: CloseProgrammingComponent, canActivate: [AuthGuard] },
      { path: 'lock-programming', component: LockProgrammingComponent, canActivate: [AuthGuard] },
      { path: 'open-programming', component: OpenProgrammingComponent, canActivate: [AuthGuard] },
      {
        path: 'requests',
        component: RequestsComponent,
        canActivate: [AuthGuard],
        children: [
          { path: '', component: RequestsSummaryComponent, canActivate: [AuthGuard] },
          { path: ':id', component: RequestsSummaryComponent, canActivate: [AuthGuard] },
          { path: 'details/:id', component: RequestsDetailsComponent, canActivate: [AuthGuard] }
        ]
      },
      { path: 'requests-approval', component: RequestsApprovalComponent, canActivate: [AuthGuard] },
      { path: 'ufr-requests', component: UfrRequestsComponent, canActivate: [AuthGuard] },
      { path: 'toa', component: ToaComponent, canActivate: [AuthGuard] },
      {
        path: 'total-appropriation-priority',
        component: TotalAppropriationPriorityComponent,
        canActivate: [AuthGuard]
      },
      {
        path: 'work-space-management',
        component: WorkSpaceManagementComponent,
        canActivate: [AuthGuard]
      },
      { path: 'compare-work-spaces', component: CompareWorkSpacesComponent, canActivate: [AuthGuard] }
    ]
  }
];
@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ProgrammingFeatureRoutingModule {}
