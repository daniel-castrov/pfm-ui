import { Component, OnInit, Input } from '@angular/core';
import { EditBudgetDetailsComponent } from '../edit-budget-details.component';
import { Appropriation, RdteDataService , RdteData, Budget, BES, BESService, PB, PBService} from '../../../../generated';
import { CurrentPhase } from "../../../../services/current-phase.service";
import {join} from "../../../../utils/join";
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
  pbs:PB[] = [];

  constructor(
    private currentPhase : CurrentPhase,
    private besService: BESService,
    private pbService: PBService,
    private rdteDataService: RdteDataService) { }

  ngOnInit() {
    this.init();
  }

  async init() {

    this.budget= (await this.currentPhase.budget().toPromise());
    if ( this.budget.status != "OPEN" ){
      Notify.error("There is no OPEN budget phase");
    } else {
      [this.bess, this.pbs] = await join( this.besService.getByBudget(this.budget.id),
          this.pbService .getByBudget(this.budget.id) ) as [BES[], PB[]];      
    }
    this.parent.rdteData = {}
  }

  async onScenarioSelected(){

    if ( this.parent.selectedScenario.appropriation == Appropriation.RDTE ){

      this.clearTabData();
      let rdteData: RdteData = (await this.rdteDataService.getByContainerId( this.parent.selectedScenario.id ).toPromise()).result;

      if ( rdteData && rdteData.id ){
        this.parent.rdteData = rdteData;
      } else {
        this.parent.rdteData = rdteData;
        this.parent.rdteData.containerId = this.parent.selectedScenario.id;
      }
    } else if ( this.parent.selectedScenario.appropriation == Appropriation.PROC ){
      this.parent.selectedScenario = undefined;
      Notify.info("PROC not yet implemented")
    } else {
      this.parent.selectedScenario = undefined;
      Notify.error("Unknown Appropriation")
    }
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