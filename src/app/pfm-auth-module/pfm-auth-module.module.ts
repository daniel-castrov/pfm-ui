import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { PfmAuthModuleRoutingModule } from './pfm-auth-module-routing.module';
import { SigninComponent } from './signin/signin.component';
import { SigninService } from './services/signin.service';
import { ChooseCommunityComponent } from './choose-community/choose-community.component';
import { SignOutComponent } from './sign-out/sign-out.component';
import { PfmCoreuiModule } from '../pfm-coreui/pfm-coreui.module';
import { CommunityService } from '../services/community-service';
import { CommunityServiceImpl } from '../services/community-service-impl.service';

@NgModule({
  declarations: [SigninComponent, ChooseCommunityComponent, SignOutComponent],
  imports: [CommonModule, PfmAuthModuleRoutingModule, PfmCoreuiModule],
  exports: [],
  providers: [SigninService, { provide: CommunityService, useClass: CommunityServiceImpl }]
})
export class PfmAuthModuleModule {}
