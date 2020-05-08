import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { BudgetFeatureRoutingModule } from './budget-feature-routing.module';
import { BudgetFeatureComponent } from './budget-feature.component';

@NgModule({
  declarations: [BudgetFeatureComponent],
  imports: [CommonModule, BudgetFeatureRoutingModule]
})
export class BudgetFeatureModule {}
