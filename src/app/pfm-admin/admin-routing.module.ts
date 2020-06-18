import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { AuthGuard } from '../pfm-auth-module/services/auth-guard';
import { ManageSnapshotComponent } from './manage-snapshot/manage-snapshot.component';
import { AdminComponent } from './admin.component';

const routes: Routes = [
  {
    path: '',
    component: AdminComponent,
    canActivate: [AuthGuard],
    children: [{ path: 'manage-snapshots', component: ManageSnapshotComponent, canActivate: [AuthGuard] }]
  }
];
@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AdminRoutingModule {}
