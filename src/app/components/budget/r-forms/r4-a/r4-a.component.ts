import {Component, OnInit} from '@angular/core';
import { BESService, PBService, Budget, BES, PB, ProgramService, Program, RdteProgramDataService, RdteProgramData, BPI } from '../../../../generated';
import { CurrentPhase } from '../../../../services/current-phase.service';
import {join} from '../../../../utils/join';
import { ActivatedRoute } from '@angular/router';
import { TagsUtils, TagType } from '../../../../services/tags-utils.service';
import {Observable} from 'rxjs';

@Component({
  selector: 'r4A',
  templateUrl: './r4-a.component.html',
  styleUrls: ['./r4-a.component.scss']
})
export class R4AComponent implements OnInit {

  r4Preview: {eventName?: string, startYear?: number, startQuarter?: number, endYear?: number, endQuarter?: number}[];
  fy: number;
  pe: string;
  item: string;
  ba: string;
  now = new Date();
  bess: BES[] = [];
  pbs: PB[] = [];

  programs: Program[];
  constructor(
    private route: ActivatedRoute,
    private currentPhase: CurrentPhase,
    private besService: BESService,
    private pbService: PBService,
    private programService: ProgramService,
    private rdteProgramDataService: RdteProgramDataService,
    public tagsUtils: TagsUtils,
  ) { this.r4Preview = []; }

  async ngOnInit() {
    this.pe = this.route.snapshot.params['programElement'];
    this.item = this.route.snapshot.params['item'];
    let budget: Budget = {};
    budget = await this.currentPhase.budget().toPromise();
    this.fy = budget.fy;
    [this.bess, this.pbs] = await join( this.besService.getByBudget(budget.id),
                                        this.pbService .getByBudget(budget.id) ) as [BES[], PB[]];
    this.bess = this.bess.filter(bes => bes.appropriation==='RDTE');
    for(let i = 0;i<this.bess.length;i++) {
      await this.initPrograms(this.bess[i]);
      this.initBA(this.programs);
      for(let j=0;j<this.programs.length;j++) {
        let selectedProgram = this.programs[j];
        await this.initPreview(selectedProgram);
      }
    }
  }

  async initPreview(program: Program) {
    await new Promise( async (resolve) => {
      try {
        let rdteProgramData: RdteProgramData = null;
        rdteProgramData = (await this.rdteProgramDataService.getByProgramId(program.id).toPromise()).result;
        let bpis = rdteProgramData.bpis.filter(bpi=> bpi.pe===this.pe && bpi.item===this.item)
        bpis.forEach(bpi=>{
          bpi.r4Data.forEach(r4 => {
            this.r4Preview.push({
              eventName: program.shortName + " - " + r4.eventName,
              startYear: r4.startYear,
              startQuarter: r4.startQuarter,
              endYear: r4.endYear,
              endQuarter: r4.endQuarter
            });
          });
        });
      } catch (e) {}
      resolve();
    });
  }

  private async initPrograms(bess: BES) {
    let containerId = bess.id;
    this.programs = (await this.programService.getByContainer(containerId).toPromise()).result;
    this.programs = this.programs.filter(program=>program.fundingLines.length>0);
  }
  private async initBA(programs:Program[]) {
    let fls = [];
    programs.forEach(program => program.fundingLines.forEach(fundingLine => {
      fls.push(fundingLine);
    }));
    const flWithPE = fls.find(fl => fl.programElement === this.pe);
    this.ba = flWithPE && flWithPE.baOrBlin;
  }
  peName(): Observable<string> {
    if(!this.pe) return;
    return this.tagsUtils.name(TagType.PROGRAM_ELEMENT, this.pe);
  }
  itemName(): Observable<string> {
    if(!this.item) return;
    return this.tagsUtils.name(TagType.ITEM, this.item);
  }
}
