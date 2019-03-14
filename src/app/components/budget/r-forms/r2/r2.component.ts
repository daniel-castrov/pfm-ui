import {Component, OnInit} from '@angular/core';
import {ActivatedRoute} from "@angular/router";
import {BES, BudgetService, PB, Program, PRService} from "../../../../generated";
import {ScenarioService} from "../../../../services/scenario.service";
import {TagsService, TagType} from "../../../../services/tags.service";
import {Observable} from "rxjs";
import {FL} from "./FL";

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
  fls: FL[];
  ba: string;

  constructor( private route: ActivatedRoute,
               private scenarioService: ScenarioService,
               private budgetService: BudgetService,
               public tagsService: TagsService,
               private prService: PRService ) {}

  async ngOnInit() {
    const scenarioId = this.route.snapshot.params['scenarioId'];
    this.programElement = this.route.snapshot.params['programElement'];
    this.scenario = await this.scenarioService.scenario(scenarioId);
    const budgets = (await this.budgetService.getAll().toPromise()).result;
    this.fy = budgets.find(budget => budget.id == this.scenario.budgetId).fy;
    this.fls = await this.getFLs();
    const flWithPE = this.fls.find(fl => fl.programElement === this.programElement);
    this.ba = flWithPE && flWithPE.baOrBlin;
  }

  peName(): Observable<string> {
    if(!this.programElement) return;
    return this.tagsService.name(TagType.PROGRAM_ELEMENT, this.programElement);
  }

  baName(): Observable<string> {
    if(!this.ba) return;
    return this.tagsService.name(TagType.BA, this.ba);
  }

  private async getFLs(): Promise<FL[]> {
    const result: FL[] = [];
    const programs:Program[] = (await this.prService.getByContainer(this.scenario.id).toPromise()).result;
    programs.forEach(program => program.fundingLines.forEach(fundingLine => {
      result.push({name:program.shortName, ...fundingLine});
    }));
    return result;
  }

}
