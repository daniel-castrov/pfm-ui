import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ProgrammingFeatureRoutingModule } from './programming-feature-routing.module';
import { ProgrammingFeatureComponent } from './programming-feature.component';
import { CreateProgrammingComponent } from './create-programming/create-programming.component';
import { PfmCoreuiModule } from '../pfm-coreui/pfm-coreui.module';
import { ProgrammingService } from '../../app/programming-feature/services/programming-service';
import { ProgrammingServiceMock } from '../../app/programming-feature/services/programming-service-mock';
import { HttpClientModule } from '@angular/common/http';
import { PfmSecureFileuploadModule } from '../pfm-secure-fileupload/pfm-secure-fileupload.module';

@NgModule({
  declarations: [ProgrammingFeatureComponent, CreateProgrammingComponent],
  imports: [
    CommonModule,
    HttpClientModule,
    PfmCoreuiModule,
    PfmSecureFileuploadModule,
    ProgrammingFeatureRoutingModule
  ],
  providers: [{provide: ProgrammingService, useClass: ProgrammingServiceMock}]
})
export class ProgrammingFeatureModule { }
