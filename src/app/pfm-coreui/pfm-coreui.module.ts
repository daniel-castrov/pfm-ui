import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AppHeaderComponent } from './app-header/app-header.component';
import { MenuBarComponent } from './menu-bar/menu-bar.component';
import { RouterModule } from '@angular/router';
import { DialogManagerComponent } from './dialog-manager/dialog-manager.component';
import { MaterialModule } from '../material.module';
import { BusyComponent } from './busy/busy.component';
import { AngularFontAwesomeModule } from 'angular-font-awesome';
import { CardComponent } from './card/card.component';

@NgModule({
  declarations: [AppHeaderComponent, MenuBarComponent, DialogManagerComponent, BusyComponent, CardComponent],
  imports: [
    CommonModule, RouterModule, MaterialModule, AngularFontAwesomeModule
  ],
  exports: [AppHeaderComponent, MenuBarComponent, DialogManagerComponent, BusyComponent, CardComponent]
})
export class PfmCoreuiModule { }
