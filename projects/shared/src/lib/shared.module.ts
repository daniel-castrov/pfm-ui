import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { SharedComponent } from './shared.component';
import { TabsComponent } from './tabs/tabs.component';
import { TabComponent } from './tabs/tab.component';
import { ButtonComponent } from './button/button.component';
import { RolesNotNowDirective } from './directives/roles-not-now.directive';
import { RolesOkDirective } from './directives/roles-ok.directive';

const sharedComponents = [SharedComponent, ButtonComponent, TabComponent, TabsComponent, RolesNotNowDirective, RolesOkDirective];

@NgModule({
  imports: [CommonModule],
  declarations: [...sharedComponents],
  exports: [...sharedComponents],
  providers: []
})
export class SharedModule {}
