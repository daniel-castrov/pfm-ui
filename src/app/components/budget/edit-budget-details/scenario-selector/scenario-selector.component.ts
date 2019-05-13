import {Component, EventEmitter, OnInit, Output} from '@angular/core';
import {Appropriation, BES, BESService, Budget, PB, PBService, RdteBudgetData, RdteBudgetDataService,} from '../../../../generated';
import {CurrentPhase} from '../../../../services/current-phase.service';
import {join} from '../../../../utils/join';
import {Notify} from '../../../../utils/Notify';

@Component({
  selector: 'scenario-selector',
  templateUrl: './scenario-selector.component.html',
  styleUrls: ['../edit-budget-details.component.scss']
})
export class ScenarioSelectorComponent implements OnInit {

  selectedScenario : BES | PB;
  rdteBudgetData: RdteBudgetData;
  @Output() scenarioChanged = new EventEmitter();

  budget: Budget={};
  bess: BES[] = [];
  pbs: PB[] = [];

  constructor( private currentPhase : CurrentPhase,
               private besService: BESService,
               private pbService: PBService) {}

  async ngOnInit() {
    this.budget = await this.currentPhase.budget().toPromise();
    [this.bess, this.pbs] = await join( this.besService.getByBudget(this.budget.id),
                                        this.pbService .getByBudget(this.budget.id) ) as [BES[], PB[]];
  }

  async onScenarioSelected() {
    if ( this.selectedScenario.appropriation == Appropriation.RDTE ) {
      this.scenarioChanged.emit(this.selectedScenario);
    } else if ( this.selectedScenario.appropriation == Appropriation.PROC ){
      this.selectedScenario = undefined;
      Notify.info("PROC not yet implemented");
    } else {
      this.selectedScenario = undefined;
      Notify.error("Unknown Appropriation");
    }
  }

}
