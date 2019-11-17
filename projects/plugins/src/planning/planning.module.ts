import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';


import { SharedModule } from 'shared';
import { PlanningComponent } from './planning.component';
import { PlanningCoreModule } from '../../../planning-core/src/lib/planning-core.module';
import { PfmCoreuiModule } from '../../../../src/app/pfm-coreui/pfm-coreui.module';

@NgModule({
  imports: [CommonModule, SharedModule, PfmCoreuiModule],
  declarations: [PlanningComponent],
  entryComponents: [PlanningComponent]
})
export class PlanningModule {
  static entry = PlanningComponent;
}
