import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { PfmUserProfileModuleComponent } from './pfm-user-profile-module.component';
import { AuthGuard } from '../pfm-auth-module/services/auth-guard';

const routes: Routes = [{ path: '', component: PfmUserProfileModuleComponent, canActivate: [AuthGuard] }];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class PfmUserProfileModuleRoutingModule {}
