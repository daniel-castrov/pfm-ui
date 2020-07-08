import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ExecutionFeatureRoutingModule } from './execution-feature-routing.module';
import { ExecutionFeatureComponent } from './execution-feature.component';
import { CreateExecutionComponent } from './create-execution/create-execution.component';
import { PfmCoreuiModule } from '../pfm-coreui/pfm-coreui.module';
import { PfmSecureFileuploadModule } from '../pfm-secure-fileupload/pfm-secure-fileupload.module';
import { ExecutionService } from './services/execution.service';
import { ExecutionServiceImpl } from './services/execution.service-impl';
import { FundsUpdateComponent } from './funds-update/funds-update.component';
import { ExecutionLineService } from './services/execution-line.service';
import { ExecutionLineServiceImpl } from './services/execution-line.service-impl';

@NgModule({
  declarations: [ExecutionFeatureComponent, CreateExecutionComponent, FundsUpdateComponent],
  imports: [CommonModule, ExecutionFeatureRoutingModule, PfmCoreuiModule, PfmSecureFileuploadModule],
  providers: [
    { provide: ExecutionService, useClass: ExecutionServiceImpl },
    { provide: ExecutionLineService, useClass: ExecutionLineServiceImpl }
  ]
})
export class ExecutionFeatureModule {}
