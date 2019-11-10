import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { PfmUserCommunitiesModuleComponent } from './pfm-user-communities-module.component';
import { AuthGuard } from '../pfm-auth-module/services/auth-guard';

const routes: Routes = [{ path: '', component: PfmUserCommunitiesModuleComponent, canActivate: [AuthGuard] }];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class PfmUserCommunitiesModuleRoutingModule { }
