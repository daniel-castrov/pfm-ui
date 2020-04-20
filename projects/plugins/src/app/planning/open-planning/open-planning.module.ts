import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { OpenPlanningComponent } from './open-planning.component';

@NgModule({
  declarations: [OpenPlanningComponent],
  imports: [CommonModule]
})
export class OpenPlanningModule {
  static entry = OpenPlanningComponent;
}
