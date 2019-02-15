import { Component, ViewChild, ChangeDetectorRef, AfterContentChecked } from '@angular/core';

import {HeaderComponent} from '../../../components/header/header.component';
import { Budget, PB, R0R1Data } from '../../../generated';

import { TitleTabComponent } from './title-tab/title-tab.component';
import { OverviewTabComponent } from './overview-tab/overview-tab.component';
import { R1TabComponent } from './r1-tab/r1-tab.component';

@Component({
  selector: 'edit-budget-scenario',
  templateUrl: './edit-budget-scenario.component.html',
  styleUrls: ['./edit-budget-scenario.component.scss']
})
export class EditBudgetScenarioComponent implements AfterContentChecked {

  @ViewChild(HeaderComponent) header;
  @ViewChild(TitleTabComponent) titleTabComponent: TitleTabComponent;
  @ViewChild(OverviewTabComponent) overviewTabComponent: OverviewTabComponent;
  @ViewChild(R1TabComponent) r1TabComponent: R1TabComponent;

  budget:Budget={};
  pbs:PB[] = [];
  selectedScenario:PB;
  r0r1data:R0R1Data;

  constructor(
    private cd: ChangeDetectorRef) {}

  ngAfterContentChecked() {
    this.cd.detectChanges();
  }

}
