import { NgModule } from '@angular/core';
import { CommonModule, CurrencyPipe } from '@angular/common';

import { ExecutionFeatureRoutingModule } from './execution-feature-routing.module';
import { ExecutionFeatureComponent } from './execution-feature.component';
import { CreateExecutionComponent } from './create-execution/create-execution.component';
import { PfmCoreuiModule } from '../pfm-coreui/pfm-coreui.module';
import { PfmSecureFileuploadModule } from '../pfm-secure-fileupload/pfm-secure-fileupload.module';
import { ExecutionService } from './services/execution.service';
import { ExecutionServiceImpl } from './services/execution.service-impl';
import { RealignFundsComponent } from './funds-update/realign-funds/realign-funds.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { ExecutionLineService } from './services/execution-line.service';
import { ExecutionLineServiceImpl } from './services/execution-line.service-impl';
import { FundsUpdateComponent } from './funds-update/funds-update.component';
import { PfmSecureFiledownloadModule } from '../pfm-secure-filedownload/pfm-secure-filedownload.module';
import { PropertyService } from '../programming-feature/services/property.service';
import { PropertyServiceImpl } from '../programming-feature/services/property-impl.service';
import { ExecutionEventService } from './services/execution-event.service';
import { ExecutionEventServiceImpl } from './services/execution-event.service-impl';

@NgModule({
  declarations: [ExecutionFeatureComponent, CreateExecutionComponent, FundsUpdateComponent, RealignFundsComponent],
  imports: [
    CommonModule,
    ExecutionFeatureRoutingModule,
    PfmCoreuiModule,
    PfmSecureFileuploadModule,
    ReactiveFormsModule,
    FormsModule,
    FontAwesomeModule,
    NgbModule,
    PfmSecureFiledownloadModule
  ],
  providers: [
    CurrencyPipe,
    { provide: ExecutionService, useClass: ExecutionServiceImpl },
    { provide: ExecutionLineService, useClass: ExecutionLineServiceImpl },
    { provide: ExecutionEventService, useClass: ExecutionEventServiceImpl },
    { provide: PropertyService, useClass: PropertyServiceImpl },
    CurrencyPipe
  ]
})
export class ExecutionFeatureModule {}
