import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import {FileDownloadService} from '../pfm-secure-filedownload/services/file-download-service';
import { SecureUploadComponent } from './secure-upload/secure-upload.component';
import {AngularFontAwesomeModule} from 'angular-font-awesome';
import {FileUploadModule} from 'ng2-file-upload';

@NgModule({
  declarations: [SecureUploadComponent],
  imports: [
    CommonModule, FileUploadModule, AngularFontAwesomeModule
  ],
  exports: [SecureUploadComponent],
	providers: []
})
export class PfmSecureFileuploadModule { }
