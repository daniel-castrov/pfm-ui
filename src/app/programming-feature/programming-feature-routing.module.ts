import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { ProgrammingFeatureComponent } from './programming-feature.component';
import { AuthGuard } from '../pfm-auth-module/services/auth-guard';
import { CreateProgrammingComponent } from './create-programming/create-programming.component';

const routes: Routes = [
  {
    path: '', component: ProgrammingFeatureComponent, canActivate: [AuthGuard], children: [
      {
        path: 'create-programming', component: CreateProgrammingComponent, canActivate: [AuthGuard]
      }
    ]
  }
];
@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ProgrammingFeatureRoutingModule { }
