import { Component, OnInit, Input } from '@angular/core';
import { EditBudgetScenarioComponent } from '../edit-budget-scenario.component';
import { PB } from '../../../../generated';

@Component({
  selector: 'scenario-selector',
  templateUrl: './scenario-selector.component.html',
  styleUrls: ['./scenario-selector.component.scss']
})
export class ScenarioSelectorComponent implements OnInit {

  @Input() parent: EditBudgetScenarioComponent;

  constructor() { }

  ngOnInit() {
    this.init();
  }

  init() {

    // Fetch Data
    this.parent.budget={
      id:"12",
      fy:2018,
      communityId:"7",
    }

    this.parent.pbs.push ({
        id:"1",
        budgetId:"12",
        name:"pb1"
      });
      this.parent.pbs.push ({
        id:"2",
        budgetId:"12",
        name:"pb2"
      });
      this.parent.pbs.push ({
        id:"3",
        budgetId:"12",
        name:"pb3"
      });
    
  }

  onScenarioSelected(){
    setTimeout(() => {
      // initialize agGrid components in the parent.
    });
  }

}
