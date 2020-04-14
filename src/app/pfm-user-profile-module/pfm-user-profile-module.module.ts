import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { PfmUserProfileModuleRoutingModule } from './pfm-user-profile-module-routing.module';
import { PfmUserProfileModuleComponent } from './pfm-user-profile-module.component';
import { ReactiveFormsModule } from '@angular/forms';
import { PfmSecureFileuploadModule } from '../pfm-secure-fileupload/pfm-secure-fileupload.module';
import { PfmCoreuiModule } from '../pfm-coreui/pfm-coreui.module';

@NgModule({
  declarations: [PfmUserProfileModuleComponent],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    PfmUserProfileModuleRoutingModule,
    PfmSecureFileuploadModule,
    PfmCoreuiModule
  ]
})
export class PfmUserProfileModuleModule {}
