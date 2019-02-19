import { Component, OnInit, Input } from '@angular/core';
import { EditBudgetScenarioComponent } from '../edit-budget-scenario.component';
import {Appropriation, StringMap} from '../../../../generated';

@Component({
  selector: 'scenario-selector',
  templateUrl: './scenario-selector.component.html',
  styleUrls: ['../edit-budget-scenario.component.scss']
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
        name:"BES Default",
        appropriation: Appropriation.RDTE
      });
      this.parent.pbs.push ({
        id:"2",
        budgetId:"12",
        name:"BES 2",
        appropriation: Appropriation.RDTE
      });
      this.parent.pbs.push ({
        id:"3",
        budgetId:"12",
        name:"BES 3",
        appropriation: Appropriation.RDTE
      });

      this.resetr0r1data();

  }

  resetr0r1data(){
    this.parent.r0r1data = {}
    this.parent.r0r1data.fileArea="budget";

    let pes:string[] = [ "0601384BP", "0602384BP" , "0603384BP", "0603884BP", "0604384BP", "0605384BP", "0605502BP", "0607384BP"];
    let toc:StringMap={};
    pes.forEach( pe => { toc[pe]="" } )
    this.parent.r0r1data.toc=toc;
  }

  onScenarioSelected(){
    setTimeout(() => {

      this.resetr0r1data();

      this.parent.titleTabComponent.logoImagePath="";
      this.parent.r1TabComponent.r1FileName="";
      this.parent.overviewTabComponent.ovFileName="";

      // initialize agGrid components in the parent.
    });
  }

}
