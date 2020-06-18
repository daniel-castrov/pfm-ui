import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PfmCoreuiModule } from '../pfm-coreui/pfm-coreui.module';
import { HttpClientModule } from '@angular/common/http';
import { PfmSecureFileuploadModule } from '../pfm-secure-fileupload/pfm-secure-fileupload.module';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { ManageSnapshotComponent } from './manage-snapshot/manage-snapshot.component';
import { AdminRoutingModule } from './admin-routing.module';
import { AdminComponent } from './admin.component';
import { FormsModule } from '@angular/forms';

@NgModule({
  declarations: [AdminComponent, ManageSnapshotComponent],
  imports: [
    CommonModule,
    HttpClientModule,
    AdminRoutingModule,
    FormsModule,
    PfmCoreuiModule,
    PfmSecureFileuploadModule,
    NgbModule
  ],
  providers: []
})
export class AdminModule {}
