import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { PfmUserNotificationsModuleComponent } from './pfm-user-notifications-module.component';
import { AuthGuard } from '../pfm-auth-module/services/auth-guard';

const routes: Routes = [{ path: '', component: PfmUserNotificationsModuleComponent, canActivate: [AuthGuard] }];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class PfmUserNotificationsModuleRoutingModule { }
