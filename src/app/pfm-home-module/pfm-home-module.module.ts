import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { PfmHomeModuleRoutingModule } from './pfm-home-module-routing.module';
import { PfmHomeModuleComponent } from './pfm-home-module.component';
import { PfmCoreuiModule } from '../pfm-coreui/pfm-coreui.module';


@NgModule({
  declarations: [PfmHomeModuleComponent],
  imports: [
    CommonModule,
    PfmHomeModuleRoutingModule,
    PfmCoreuiModule
  ]
})
export class PfmHomeModuleModule { }
