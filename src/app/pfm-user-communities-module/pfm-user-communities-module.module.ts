import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { PfmUserCommunitiesModuleRoutingModule } from './pfm-user-communities-module-routing.module';
import { PfmUserCommunitiesModuleComponent } from './pfm-user-communities-module.component';

@NgModule({
  declarations: [PfmUserCommunitiesModuleComponent],
  imports: [CommonModule, PfmUserCommunitiesModuleRoutingModule]
})
export class PfmUserCommunitiesModuleModule {}
