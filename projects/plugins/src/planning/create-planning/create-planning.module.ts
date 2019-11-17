import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { CreatePlanningComponent } from './planning.component';
import { PfmCoreuiModule } from '../../../../../src/app/pfm-coreui/pfm-coreui.module';

@NgModule({
  imports: [CommonModule, PfmCoreuiModule],
  declarations: [CreatePlanningComponent],
  entryComponents: [CreatePlanningComponent]
})
export class CreatePlanningModule {
  static entry = CreatePlanningComponent;
}
