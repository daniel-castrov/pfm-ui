import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { PfmUserRolesModuleComponent } from './pfm-user-roles-module.component';
import { AuthGuard } from '../pfm-auth-module/services/auth-guard';

const routes: Routes = [{ path: '', component: PfmUserRolesModuleComponent, canActivate: [AuthGuard] }];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class PfmUserRolesModuleRoutingModule { }
