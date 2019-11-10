import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { PfmUserProfileModuleRoutingModule } from './pfm-user-profile-module-routing.module';
import { PfmUserProfileModuleComponent } from './pfm-user-profile-module.component';


@NgModule({
  declarations: [PfmUserProfileModuleComponent],
  imports: [
    CommonModule,
    PfmUserProfileModuleRoutingModule
  ]
})
export class PfmUserProfileModuleModule { }
