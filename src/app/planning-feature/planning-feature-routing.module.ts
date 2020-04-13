import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { PlanningFeatureComponent } from './planning-feature.component';
import { AuthGuard } from '../pfm-auth-module/services/auth-guard';
import { CreatePlanningComponent } from './create-planning/create-planning.component';
import { LockPlanningComponent } from './lock-planning/lock-planning.component';
import { OpenPlanningComponent } from './open-planning/open-planning.component';
import { ClosePlanningComponent } from './close-planning/close-planning.component';
import { MissionPrioritiesComponent } from './mission-priorities/mission-priorities.component';

const routes: Routes = [
  {
    path: '',
    component: PlanningFeatureComponent,
    canActivate: [AuthGuard],
    children: [
      {
        path: 'create-planning',
        component: CreatePlanningComponent,
        canActivate: [AuthGuard]
      },
      {
        path: 'open-planning',
        component: OpenPlanningComponent,
        canActivate: [AuthGuard]
      },
      {
        path: 'lock-planning',
        component: LockPlanningComponent,
        canActivate: [AuthGuard]
      },
      {
        path: 'close-planning',
        component: ClosePlanningComponent,
        canActivate: [AuthGuard]
      },
      {
        path: 'mission-priorities',
        component: MissionPrioritiesComponent,
        canActivate: [AuthGuard]
      }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class PlanningFeatureRoutingModule {}
