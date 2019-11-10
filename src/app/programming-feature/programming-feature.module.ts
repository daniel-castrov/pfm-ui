import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ProgrammingFeatureRoutingModule } from './programming-feature-routing.module';
import { ProgrammingFeatureComponent } from './programming-feature.component';


@NgModule({
  declarations: [ProgrammingFeatureComponent],
  imports: [
    CommonModule,
    ProgrammingFeatureRoutingModule
  ]
})
export class ProgrammingFeatureModule { }
