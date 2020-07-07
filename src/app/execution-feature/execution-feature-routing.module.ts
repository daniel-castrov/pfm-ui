import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { ExecutionFeatureComponent } from './execution-feature.component';
import { AuthGuard } from '../pfm-auth-module/services/auth-guard';
import { CreateExecutionComponent } from './create-execution/create-execution.component';
import { RealignFundsComponent } from './funds-update/realign-funds/realign-funds.component';
import { FundsUpdateComponent } from './funds-update/funds-update.component';

const routes: Routes = [
  {
    path: '',
    component: ExecutionFeatureComponent,
    canActivate: [AuthGuard],
    children: [
      { path: 'create-execution', component: CreateExecutionComponent, canActivate: [AuthGuard] },
      {
        path: 'funds-update',
        component: FundsUpdateComponent,
        canActivate: [AuthGuard],
        children: [
          { path: '', component: CreateExecutionComponent, canActivate: [AuthGuard] },
          { path: 'realign-funds', component: RealignFundsComponent, canActivate: [AuthGuard] }
        ]
      }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ExecutionFeatureRoutingModule {}
