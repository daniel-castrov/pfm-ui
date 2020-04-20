import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MissionPrioritiesComponent } from './mission-priorities.component';

@NgModule({
  declarations: [MissionPrioritiesComponent],
  imports: [CommonModule]
})
export class MissionPrioritiesModule {
  static entry = MissionPrioritiesComponent;
}
