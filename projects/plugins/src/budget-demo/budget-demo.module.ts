import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { SharedModule } from 'shared';
import { BudgetCoreModule } from '../../../budget-core/src/lib/budget-core.module';
import { BudgetDemoComponent } from './budget-demo.component';

@NgModule({
  imports: [CommonModule, SharedModule, BudgetCoreModule],
  declarations: [BudgetDemoComponent],
  entryComponents: [BudgetDemoComponent]
})
export class BudgetDemoModule {
  static entry = BudgetDemoComponent;
}
