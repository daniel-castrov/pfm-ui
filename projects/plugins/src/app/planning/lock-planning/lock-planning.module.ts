import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LockPlanningComponent } from './lock-planning.component';

@NgModule({
  declarations: [LockPlanningComponent],
  imports: [CommonModule]
})
export class LockPlanningModule {
  static entry = LockPlanningComponent;
}
