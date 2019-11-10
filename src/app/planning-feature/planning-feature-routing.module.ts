import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { PlanningFeatureComponent } from './planning-feature.component';
import { AuthGuard } from '../pfm-auth-module/services/auth-guard';

const routes: Routes = [{ path: '', component: PlanningFeatureComponent , canActivate: [AuthGuard]}];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class PlanningFeatureRoutingModule { }
