import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DashboardComponent } from './dashboard/dashboard.component';
import { DemoWidgetMissionFundingPriorityComponent } from './widgets/demo-widget-mission-funding-priority/demo-widget-mission-funding-priority.component';
import { DemoWidgetMissionFundingMoneyComponent } from './widgets/demo-widget-mission-funding-money/demo-widget-mission-funding-money.component';
import { Ng2GoogleChartsModule } from 'ng2-google-charts';
import { MaterialModule } from '../material.module';
import { DemoWidgetPOMPhaseFundingComponent } from './widgets/demo-widget-pom-phase-funding/demo-widget-pom-phase-funding.component';
import { DemoWidgetPrStatusComponent } from './widgets/demo-widget-pr-status/demo-widget-pr-status.component';

@NgModule({
  declarations: [DashboardComponent, DemoWidgetMissionFundingPriorityComponent, DemoWidgetMissionFundingMoneyComponent, DemoWidgetPOMPhaseFundingComponent, DemoWidgetPrStatusComponent],
  imports: [
    CommonModule, Ng2GoogleChartsModule, MaterialModule
  ],
  exports: [DashboardComponent],
  entryComponents: [DashboardComponent, DemoWidgetMissionFundingPriorityComponent, DemoWidgetMissionFundingMoneyComponent]
})
export class PfmDashabordModuleModule { }
