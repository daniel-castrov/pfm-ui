import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { PfmUserRolesModuleRoutingModule } from './pfm-user-roles-module-routing.module';
import { PfmUserRolesModuleComponent } from './pfm-user-roles-module.component';

@NgModule({
  declarations: [PfmUserRolesModuleComponent],
  imports: [CommonModule, PfmUserRolesModuleRoutingModule]
})
export class PfmUserRolesModuleModule {}
