import {Component, OnInit} from '@angular/core';
import {ActivatedRoute} from "@angular/router";
import {
  BES,
  BudgetService,
  FundingLine,
  PB,
  Program,
  PRService,
  R2Data,
  RdteData,
  RdteDataService
} from "../../../../generated";
import {ScenarioService} from "../../../../services/scenario.service";
import {TagsService, TagType} from "../../../../services/tags.service";
import {Observable} from "rxjs";

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
  fls: FundingLine[];
  ba: string;
  items: string[];

  constructor( private route: ActivatedRoute,
               private scenarioService: ScenarioService,
               private budgetService: BudgetService,
               public tagsService: TagsService,
               private prService: PRService,
               private rdteDataService: RdteDataService) {}

  async ngOnInit() {
    this.programElement = this.route.snapshot.params['programElement'];
    this.scenario = await this.getScenario();
    this.fy = await this.getFY();
    this.fls = await this.getFLs();
    this.ba = await this.getBA();
    this.items = await this.getItems();
  }

  peName(): Observable<string> {
    if(!this.programElement) return;
    return this.tagsService.name(TagType.PROGRAM_ELEMENT, this.programElement);
  }

  baName(): Observable<string> {
    if(!this.ba) return;
    return this.tagsService.name(TagType.BA, this.ba);
  }

  itemName(abbreviation: string): Observable<string> {
    if(!this.ba) return;
    return this.tagsService.name(TagType.ITEM, abbreviation);
  }

  private async getScenario(): Promise<BES|PB> {
    const scenarioId = this.route.snapshot.params['scenarioId'];
    return await this.scenarioService.scenario(scenarioId);
  }

  private async getFLs(): Promise<FundingLine[]> {
    const result: FundingLine[] = [];
    const programs:Program[] = (await this.prService.getByContainer(this.scenario.id).toPromise()).result;
    programs.forEach(program => program.fundingLines.forEach(fundingLine => {
      result.push(fundingLine);
    }));
    return result;
  }

  private async getFY(): Promise<number> {
    const budgets = (await this.budgetService.getAll().toPromise()).result;
    return budgets.find(budget => budget.id == this.scenario.budgetId).fy;
  }

  private async getBA(): Promise<string> {
    const flWithPE = this.fls.find(fl => fl.programElement === this.programElement);
    return flWithPE && flWithPE.baOrBlin;
  }

  private async getItems(): Promise<string[]> {
    const result: string[] = [];
    const rdteData: RdteData = (await this.rdteDataService.getByContainerId(this.scenario.id).toPromise()).result;
    const r2data: R2Data = rdteData.r2data.find(r2data => r2data.programElement === this.programElement);
    r2data.items.forEach(item => result.push(item.itemName));
    return result;
  }

  private totalForItemAndYear(item, year): number {
    if(!this.fls) return;
    return this.fls
      .filter(fl => fl.item === item)
      .map(fl => fl.funds[year])
      .reduce((a,b)=>a+b,0);
  }

  private totalForPeAndYear(programElement, year): number {
    if(!this.fls) return;
    return this.fls
      .filter(fl => fl.programElement === programElement)
      .map(fl => fl.funds[year])
      .reduce((a,b)=>a+b,0);
  }
}
