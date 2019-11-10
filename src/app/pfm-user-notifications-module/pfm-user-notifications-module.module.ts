import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { PfmUserNotificationsModuleRoutingModule } from './pfm-user-notifications-module-routing.module';
import { PfmUserNotificationsModuleComponent } from './pfm-user-notifications-module.component';


@NgModule({
  declarations: [PfmUserNotificationsModuleComponent],
  imports: [
    CommonModule,
    PfmUserNotificationsModuleRoutingModule
  ]
})
export class PfmUserNotificationsModuleModule { }
