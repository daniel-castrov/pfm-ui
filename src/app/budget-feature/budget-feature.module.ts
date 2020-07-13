import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';

import { BudgetFeatureComponent } from './budget-feature.component';
import { CreateBudgetComponent } from './create-budget.component';
import { budgetRoutes } from './budget.routes';
import { PfmCoreuiModule } from '../pfm-coreui/pfm-coreui.module';

@NgModule({
  declarations: [BudgetFeatureComponent, CreateBudgetComponent],
  imports: [CommonModule, RouterModule.forChild(budgetRoutes), FormsModule, PfmCoreuiModule]
})
export class BudgetFeatureModule {}
