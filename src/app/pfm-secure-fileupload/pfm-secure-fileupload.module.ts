import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SecureUploadComponent } from './secure-upload/secure-upload.component';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { FileUploadModule } from 'ng2-file-upload';
import { PfmCoreuiModule } from '../pfm-coreui/pfm-coreui.module';

@NgModule({
  declarations: [SecureUploadComponent],
  imports: [CommonModule, FileUploadModule, FontAwesomeModule, PfmCoreuiModule],
  exports: [SecureUploadComponent],
  providers: []
})
export class PfmSecureFileuploadModule {}
