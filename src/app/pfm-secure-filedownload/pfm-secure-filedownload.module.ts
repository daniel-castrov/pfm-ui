import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SecureDownloadComponent } from './secure-download/secure-download.component';



@NgModule({
  declarations: [SecureDownloadComponent],
  imports: [
    CommonModule
  ],
  exports: [SecureDownloadComponent]
})
export class PfmSecureFiledownloadModule { }
