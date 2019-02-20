import { Component, ViewChild, ChangeDetectorRef, AfterContentChecked } from '@angular/core';

import {HeaderComponent} from '../../../components/header/header.component';
import { Budget, PB, RdteData } from '../../../generated';

import { TitleTabComponent } from './title-tab/title-tab.component';
import { OverviewTabComponent } from './overview-tab/overview-tab.component';
import { R1TabComponent } from './r1-tab/r1-tab.component';
import { R2TabComponent } from './r2-tab/r2-tab.component';
import { R2aTabComponent } from './r2a-tab/r2a-tab.component';

@Component({
  selector: 'edit-budget-details',
  templateUrl: './edit-budget-details.component.html',
  styleUrls: ['./edit-budget-details.component.scss']
})
export class EditBudgetDetailsComponent implements AfterContentChecked {

  @ViewChild(HeaderComponent) header;
  @ViewChild(TitleTabComponent) titleTabComponent: TitleTabComponent;
  @ViewChild(OverviewTabComponent) overviewTabComponent: OverviewTabComponent;
  @ViewChild(R1TabComponent) r1TabComponent: R1TabComponent;
  @ViewChild( R2TabComponent ) r2TabComponent: R2TabComponent;
  @ViewChild( R2aTabComponent ) r2aTabComponent: R2aTabComponent;

  budget:Budget={};
  pbs:PB[] = [];
  selectedScenario:PB;
  rdteData:RdteData;

  constructor(
    private cd: ChangeDetectorRef) {}

  ngAfterContentChecked() {
    this.cd.detectChanges();
  }

}
