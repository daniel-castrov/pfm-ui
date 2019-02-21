import { Component, OnInit, Input } from '@angular/core';
import { EditBudgetDetailsComponent } from '../edit-budget-details.component';
import { Appropriation, StringMap, RdteDataService , RdteData } from '../../../../generated';
import { CurrentPhase } from "../../../../services/current-phase.service";
import { Notify } from '../../../../utils/Notify';

@Component({
  selector: 'scenario-selector',
  templateUrl: './scenario-selector.component.html',
  styleUrls: ['../edit-budget-details.component.scss']
})
export class ScenarioSelectorComponent implements OnInit {

  @Input() parent: EditBudgetDetailsComponent;

  constructor(
    private currentPhase : CurrentPhase,
    private rdteDataService: RdteDataService) { }

  ngOnInit() {
    this.init();
  }

  async init() {

    this.parent.budget= (await this.currentPhase.budget().toPromise());
    if ( this.parent.budget.status != "OPEN" ){
      Notify.error("There is no OPEN budget phase");
    }

    this.parent.bess.push ({
        id: "1",
        budgetId: this.parent.budget.id,
        name: "BES Default",
        appropriation: Appropriation.RDTE
      });
      this.parent.bess.push ({
        id: "2",
        budgetId: this.parent.budget.id,
        name: "BES 2",
        appropriation: Appropriation.RDTE
      });
      this.parent.bess.push ({
        id: "3",
        budgetId: this.parent.budget.id,
        name: "BES 3",
        appropriation: Appropriation.RDTE
      });     
  }

  async onScenarioSelected(){

    this.clearTabData();
    
    let rdteData: RdteData = (await this.rdteDataService.getByContainerId( this.parent.selectedScenario.id ).toPromise()).result;

    if ( rdteData && rdteData.id ){
      this.parent.isRdteDataNew=false;
      this.parent.rdteData = rdteData;
    } else {
      this.parent.isRdteDataNew=true;
      this.parent.rdteData = rdteData;
      this.parent.rdteData.containerId = this.parent.selectedScenario.id;
    }
    console.log(this.parent.rdteData );
  }

  clearTabData(){
    if ( this.parent.r2TabComponent ){ 
      this.parent.r2TabComponent.clearData(); 
    }
    if ( this.parent.r2aTabComponent ){ 
      this.parent.r2aTabComponent.cleardata();
    }
  }

  async save(){
    console.log(this.parent.rdteData );
    if ( this.parent.isRdteDataNew){
      (await this.rdteDataService.create( this.parent.rdteData ).toPromise()).result;
      this.parent.isRdteDataNew = false;
    } else {
      (await this.rdteDataService.update( this.parent.rdteData ).toPromise()).result;
    }
    console.log(this.parent.rdteData );
  }

}
