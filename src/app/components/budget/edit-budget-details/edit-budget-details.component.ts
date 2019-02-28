import { Component, ViewChild, ChangeDetectorRef, AfterContentChecked } from '@angular/core';

import {HeaderComponent} from '../../../components/header/header.component';
import { BES, RdteData, RdteDataService } from '../../../generated';
import { Notify } from '../../../utils/Notify';

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

  @ViewChild( HeaderComponent ) header;
  @ViewChild( TitleTabComponent ) titleTabComponent: TitleTabComponent;
  @ViewChild( OverviewTabComponent ) overviewTabComponent: OverviewTabComponent;
  @ViewChild( R1TabComponent) r1TabComponent: R1TabComponent;
  @ViewChild( R2TabComponent ) r2TabComponent: R2TabComponent;
  @ViewChild( R2aTabComponent ) r2aTabComponent: R2aTabComponent;

  selectedScenario:BES;
  rdteData:RdteData;

  constructor(
    private cd: ChangeDetectorRef,
    private rdteDataService: RdteDataService) {}

  ngAfterContentChecked() {
    this.cd.detectChanges();
  }

  async save(){
    this.rdteData.submitted=false;
    if ( this.rdteData.id ){
      this.rdteData = (await this.rdteDataService.update( this.rdteData ).toPromise()).result;
    } else {
      this.rdteData = (await this.rdteDataService.create( this.rdteData ).toPromise()).result;
    }
    Notify.success( "Budget Details saved successfully" );
  }
}
