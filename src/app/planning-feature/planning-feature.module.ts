import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { PlanningFeatureRoutingModule } from './planning-feature-routing.module';
import { PlanningFeatureComponent } from './planning-feature.component';


@NgModule({
  declarations: [PlanningFeatureComponent],
  imports: [
    CommonModule,
    PlanningFeatureRoutingModule
  ]
})
export class PlanningFeatureModule { }
