import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { PfmUserProfileRoutingModule } from './pfm-user-profile-routing.module';
import { PfmUserProfileComponent } from './pfm-user-profile.component';
import { ReactiveFormsModule } from '@angular/forms';
import { PfmSecureFileuploadModule } from '../pfm-secure-fileupload/pfm-secure-fileupload.module';
import { PfmCoreuiModule } from '../pfm-coreui/pfm-coreui.module';

@NgModule({
  declarations: [PfmUserProfileComponent],
  imports: [CommonModule, ReactiveFormsModule, PfmUserProfileRoutingModule, PfmSecureFileuploadModule, PfmCoreuiModule]
})
export class PfmUserProfileModule {}
