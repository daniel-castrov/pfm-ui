import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { PfmCoreuiModule } from '../../../../../../src/app/pfm-coreui/pfm-coreui.module';
import { CreatePlanningComponent } from './create-planning.component';

@NgModule({
  imports: [CommonModule, PfmCoreuiModule],
  declarations: [CreatePlanningComponent]
})
export class CreatePlanningModule {
  static entry = CreatePlanningComponent;
}
