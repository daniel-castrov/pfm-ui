import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { PfmHomeModuleComponent } from './pfm-home-module.component';
import { AuthGuard } from '../pfm-auth-module/services/auth-guard';

const routes: Routes = [{ path: '', component: PfmHomeModuleComponent , canActivate: [AuthGuard]}];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class PfmHomeModuleRoutingModule { }
