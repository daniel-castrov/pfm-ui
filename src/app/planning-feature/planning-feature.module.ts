import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { PlanningFeatureRoutingModule } from './planning-feature-routing.module';
import { PlanningFeatureComponent } from './planning-feature.component';
import { CreatePlanningComponent } from './create-planning/create-planning.component';
import { OpenPlanningComponent } from './open-planning/open-planning.component';
import { MissionPrioritiesComponent } from './mission-priorities/mission-priorities.component';
import { LockPlanningComponent } from './lock-planning/lock-planning.component';
import { ClosePlanningComponent } from './close-planning/close-planning.component';
import { PfmCoreuiModule } from '../pfm-coreui/pfm-coreui.module';


@NgModule({
  declarations: [PlanningFeatureComponent, CreatePlanningComponent, OpenPlanningComponent, MissionPrioritiesComponent, LockPlanningComponent, ClosePlanningComponent],
  imports: [
    CommonModule,
    PfmCoreuiModule,
    PlanningFeatureRoutingModule
  ]
})
export class PlanningFeatureModule { }
