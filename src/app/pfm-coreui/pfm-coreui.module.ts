import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AppHeaderComponent } from './app-header/app-header.component';
import { MenuBarComponent } from './menu-bar/menu-bar.component';
import { RouterModule } from '@angular/router';
import { DialogManagerComponent } from './dialog-manager/dialog-manager.component';
import { MaterialModule } from '../material.module';
import { BusyComponent } from './busy/busy.component';
import { SharedModule } from '../../../projects/shared/src/lib/shared.module';
import { AngularFontAwesomeModule } from 'angular-font-awesome';

@NgModule({
  declarations: [AppHeaderComponent, MenuBarComponent, DialogManagerComponent, BusyComponent],
  imports: [
    CommonModule, RouterModule, MaterialModule, AngularFontAwesomeModule, SharedModule
  ],
  exports: [AppHeaderComponent, MenuBarComponent, DialogManagerComponent, BusyComponent]
})
export class PfmCoreuiModule { }
