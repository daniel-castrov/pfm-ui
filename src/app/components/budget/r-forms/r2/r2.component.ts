import {Component, OnInit} from '@angular/core';
import {ActivatedRoute} from "@angular/router";
import {BES, BudgetService, PB} from "../../../../generated";
import {ScenarioService} from "../../../../services/scenario.service";

@Component({
  selector: 'r2',
  templateUrl: './r2.component.html',
  styleUrls: ['./r2.component.scss']
})
export class R2Component implements OnInit {

  scenario: PB | BES;
  programElement: string;

  fy: number;
  now = new Date();

  constructor( private route: ActivatedRoute,
               private scenarioService: ScenarioService,
               private budgetService: BudgetService ) {}

  async ngOnInit() {
    const scenarioId = this.route.snapshot.params['scenarioId'];
    this.scenario = await this.scenarioService.scenario(scenarioId);
    const budgets = (await this.budgetService.getAll().toPromise()).result;
    this.fy = budgets.find(budget => budget.id == this.scenario.budgetId).fy;

    this.programElement = this.route.snapshot.params['programElement'];
  }

}
