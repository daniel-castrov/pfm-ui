import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { SharedModule } from 'shared';
import { BudgetComponent } from './budget.component';
import { BudgetCoreModule } from '../../../budget-core/src/lib/budget-core.module';

@NgModule({
  imports: [CommonModule, SharedModule, BudgetCoreModule],
  declarations: [BudgetComponent],
  entryComponents: [BudgetComponent]
})
export class BudgetModule {
  static entry = BudgetComponent;
}
