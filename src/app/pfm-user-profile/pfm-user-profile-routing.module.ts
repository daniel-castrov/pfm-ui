import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { PfmUserProfileComponent } from './pfm-user-profile.component';
import { AuthGuard } from '../pfm-auth-module/services/auth-guard';

const routes: Routes = [{ path: '', component: PfmUserProfileComponent, canActivate: [AuthGuard] }];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class PfmUserProfileRoutingModule {}
