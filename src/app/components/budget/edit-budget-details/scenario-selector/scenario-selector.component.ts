import { Component, OnInit, Input } from '@angular/core';
import { EditBudgetDetailsComponent } from '../edit-budget-details.component';
import { Appropriation, RdteDataService , RdteData, Budget, BES } from '../../../../generated';
import { CurrentPhase } from "../../../../services/current-phase.service";
import { Notify } from '../../../../utils/Notify';

@Component({
  selector: 'scenario-selector',
  templateUrl: './scenario-selector.component.html',
  styleUrls: ['../edit-budget-details.component.scss']
})
export class ScenarioSelectorComponent implements OnInit {

  @Input() parent: EditBudgetDetailsComponent;

  budget:Budget={};
  bess:BES[] = [];

  constructor(
    private currentPhase : CurrentPhase,
    private rdteDataService: RdteDataService) { }

  ngOnInit() {
    this.init();
  }

  async init() {

    this.budget= (await this.currentPhase.budget().toPromise());
    if ( this.budget.status != "OPEN" ){
      Notify.error("There is no OPEN budget phase");
    }

    this.bess.push ({
        id: "1",
        budgetId: this.budget.id,
        name: "BES Default",
        appropriation: Appropriation.RDTE
      });
      this.bess.push ({
        id: "2",
        budgetId: this.budget.id,
        name: "BES 2",
        appropriation: Appropriation.RDTE
      });
      this.bess.push ({
        id: "3",
        budgetId: this.budget.id,
        name: "BES 3",
        appropriation: Appropriation.RDTE
      }); 
      this.parent.rdteData = {}
  }

  async onScenarioSelected(){

    this.clearTabData();
    
    let rdteData: RdteData = (await this.rdteDataService.getByContainerId( this.parent.selectedScenario.id ).toPromise()).result;

    if ( rdteData && rdteData.id ){
      this.parent.rdteData = rdteData;
    } else {
      this.parent.rdteData = rdteData;
      this.parent.rdteData.containerId = this.parent.selectedScenario.id;
    }
    this.parent.setCannotSubmit();
  }

  clearTabData(){
    if ( this.parent.r2TabComponent ){ 
      this.parent.r2TabComponent.clearData(); 
    }
    if ( this.parent.r2aTabComponent ){ 
      this.parent.r2aTabComponent.cleardata();
    }
  }

}
