import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { BudgetFeatureComponent } from './budget-feature.component';
import { AuthGuard } from '../pfm-auth-module/services/auth-guard';

const routes: Routes = [{ path: '', component: BudgetFeatureComponent, canActivate: [AuthGuard] }];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class BudgetFeatureRoutingModule {}
