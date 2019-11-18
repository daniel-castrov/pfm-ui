import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ClosePlanningComponent } from './close-planning.component';



@NgModule({
  declarations: [ClosePlanningComponent],
  imports: [
    CommonModule
  ],
  entryComponents: [ClosePlanningComponent]
})
export class ClosePlanningModule {
  static entry = ClosePlanningComponent;
}
