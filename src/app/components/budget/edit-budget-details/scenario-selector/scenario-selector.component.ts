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

      this.setRdteData();

  }

  setRdteData(){
    this.parent.rdteData = {}
    this.parent.rdteData.fileArea="budget";

    let pes:string[] = [ "0601384BP", "0602384BP" , "0603384BP", "0603884BP", "0604384BP", "0605384BP", "0605502BP", "0607384BP"];
    let toc:StringMap={};
    pes.forEach( pe => { toc[pe]="" } )
    this.parent.rdteData.toc=toc;
    
  }

  async onScenarioSelected(){

    let rdteData: RdteData = (await this.rdteDataService.getByContainerId( this.parent.selectedScenario.id ).toPromise()).result;

    if ( rdteData ){
      this.parent.isRdteDataNew=false;
      this.parent.rdteData = rdteData;
    } else {
      this.parent.isRdteDataNew=true;
      this.setRdteData();
      this.parent.rdteData.containerId = this.parent.selectedScenario.id;
    }
  }

  async save(){
    if ( this.parent.isRdteDataNew){
      (await this.rdteDataService.create( this.parent.rdteData ).toPromise()).result;
      this.parent.isRdteDataNew = false;
    } else {
      (await this.rdteDataService.update( this.parent.rdteData ).toPromise()).result;
    }
  }

}
