import {Component, ViewChild} from '@angular/core';
import {BES, PB, RdteBudgetData, RdteBudgetDataService} from '../../../generated';
import {R2TabComponent} from './r2-tab/r2-tab.component';
import {R2aTabComponentOnBudgetDetails} from './r2a-tab/r2a-tab-component-on-budget-details.component';
import {Notify} from '../../../utils/Notify';
import {Selection} from '../edit-program-details/program-selector/program-and-item-selector.component';

@Component({
  selector: 'edit-budget-details',
  templateUrl: './edit-budget-details.component.html',
  styleUrls: ['./edit-budget-details.component.scss']
})
export class EditBudgetDetailsComponent {

  @ViewChild( R2TabComponent ) r2TabComponent: R2TabComponent;
  @ViewChild( R2aTabComponentOnBudgetDetails ) r2aTabComponent: R2aTabComponentOnBudgetDetails;

  rdteBudgetData: RdteBudgetData;
  selection: Selection;

  constructor( private rdteBudgetDataService: RdteBudgetDataService ) {}

  async onScenarioChanged(selectedScenario: BES | PB) {
    this.rdteBudgetData = (await this.rdteBudgetDataService.getByContainerId( selectedScenario.id ).toPromise()).result;
    if ( !(this.rdteBudgetData && this.rdteBudgetData.id) ) {
      this.rdteBudgetData.containerId = selectedScenario.id;
    }
    this.clearTabData();
  }

  clearTabData(){
    if ( this.r2TabComponent ){
      this.r2TabComponent.clearData();
    }
    if ( this.r2aTabComponent ){
      this.r2aTabComponent.cleardata();
    }
  }

  async onSave(){
    this.rdteBudgetData.submitted=false;
    if ( this.rdteBudgetData.id ){
      await this.rdteBudgetDataService.update( this.rdteBudgetData ).toPromise();
    } else {
      await this.rdteBudgetDataService.create( this.rdteBudgetData ).toPromise();
    }
    Notify.success( "Budget Details saved successfully" );
  }

}
