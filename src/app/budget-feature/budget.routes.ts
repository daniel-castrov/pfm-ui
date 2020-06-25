import { Routes } from '@angular/router';

import { CreateBudgetComponent } from './create-budget.component';
import { AuthGuard } from '../pfm-auth-module/services/auth-guard';

export const budgetRoutes: Routes = [
  {
    path: 'create-budget',
    component: CreateBudgetComponent,
    canActivate: [AuthGuard]
  }
];
