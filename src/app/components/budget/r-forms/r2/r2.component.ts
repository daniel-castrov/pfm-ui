import {Component, OnInit} from '@angular/core';
import {ActivatedRoute} from '@angular/router';
import {
  BudgetService,
  FundingLine,
  LockPosition,
  LockPositionDetails,
  LockPositionService,
  PresidentialBudget,
  Program,
  ProgramService,
  R2Data,
  RdteBudgetData,
  RdteBudgetDataService,
  Tag
} from '../../../../generated';
import {ScenarioService} from '../../../../services/scenario.service';
import {TagsUtils, TagType} from '../../../../services/tags-utils.service';
import {Observable} from 'rxjs';

@Component({
  selector: 'r2',
  templateUrl: './r2.component.html',
  styleUrls: ['./r2.component.scss']
})
export class R2Component implements OnInit {

  PresidentialBudget = PresidentialBudget;

  programElement: string;

  fy: number;
  now = new Date();
  fls: FundingLine[] = [];
  ba: string;
  r2Data: R2Data;
  lockPositionDetails: LockPositionDetails;
  executionTransactionTags: Tag[]; // 'None' is not included

  constructor( private route: ActivatedRoute,
               private scenarioService: ScenarioService,
               private budgetService: BudgetService,
               public tagsUtils: TagsUtils,
               private programService: ProgramService,
               private rdteBudgetDataService: RdteBudgetDataService,
               private lockPositionService: LockPositionService ) {}

  async ngOnInit() {
    this.initExecutionTransactionTags();
    this.programElement = this.route.snapshot.params['programElement'];
    const scenarioId = this.route.snapshot.params['scenarioId'];
    this.initR2DataAndItems(scenarioId);
    this.initFLsAndBA(scenarioId);
    this.initLockPositionDetails(scenarioId);
    this.initFY(scenarioId);
  }

  private async initExecutionTransactionTags() {
    this.executionTransactionTags = await this.tagsUtils.tags(TagType.EXECUTION_TRANSACTION, true, false).toPromise();
    this.executionTransactionTags = this.executionTransactionTags.filter(tag => tag.abbr !== 'NONE');
  }

  private async initR2DataAndItems(scenarioId: string) {
    const rdteBudgetData: RdteBudgetData = (await this.rdteBudgetDataService.getByContainerId(scenarioId).toPromise()).result;
    this.r2Data = rdteBudgetData.r2Data.find(r2data => r2data.programElement === this.programElement);
  }

  private async initFLsAndBA(scenarioId: string) {
    const programs:Program[] = (await this.programService.getByContainer(scenarioId).toPromise()).result;
    programs.forEach(program => program.fundingLines.forEach(fundingLine => {
      this.fls.push(fundingLine);
    }));
    const flWithPE = this.fls.find(fl => fl.programElement === this.programElement);
    this.ba = flWithPE && flWithPE.baOrBlin;
  }

  private async initLockPositionDetails(scenarioId: string) {
    const lockPosition: LockPosition = (await this.lockPositionService.getLatestForScenario(scenarioId).toPromise()).result;
    this.lockPositionDetails = lockPosition.mapPeToDetails[this.programElement];
  }

  private async initFY(scenarioId: string) {
    const scenario = await this.scenarioService.scenario(scenarioId);
    const budgets = (await this.budgetService.getAll().toPromise()).result;
    this.fy = budgets.find(budget => budget.id == scenario.budgetId).fy;
  }

  peName(): Observable<string> {
    if(!this.programElement) return;
    return this.tagsUtils.name(TagType.PROGRAM_ELEMENT, this.programElement);
  }

  baName(): Observable<string> {
    if(!this.ba) return;
    return this.tagsUtils.name(TagType.BA, this.ba);
  }

  itemName(abbreviation: string): Observable<string> {
    if(!this.ba) return;
    return this.tagsUtils.name(TagType.ITEM, abbreviation);
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

  private totalAdjustmentsFor(year: string): number {
    if(!this.executionTransactionTags) return 0;
    if(!this.lockPositionDetails) return 0;
    return this.executionTransactionTags
      .map(tag => this.lockPositionDetails.adjustments[tag.abbr][year].calculated || this.lockPositionDetails.adjustments[tag.abbr][year].adjusted)
      .reduce((a,b)=>a+b,0);
  }

  private getValueOrNA(value:string) :string {
    if ( !value || value.trim() == "" ) return "N/A";
    return value;
  }

}
