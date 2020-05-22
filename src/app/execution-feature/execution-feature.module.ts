import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ExecutionFeatureRoutingModule } from './execution-feature-routing.module';
import { ExecutionFeatureComponent } from './execution-feature.component';
import { CreateExecutionComponent } from './create-execution/create-execution.component';
import { PfmCoreuiModule } from '../pfm-coreui/pfm-coreui.module';
import { PfmSecureFileuploadModule } from '../pfm-secure-fileupload/pfm-secure-fileupload.module';

@NgModule({
  declarations: [ExecutionFeatureComponent, CreateExecutionComponent],
  imports: [CommonModule, ExecutionFeatureRoutingModule, PfmCoreuiModule, PfmSecureFileuploadModule]
})
export class ExecutionFeatureModule {}
