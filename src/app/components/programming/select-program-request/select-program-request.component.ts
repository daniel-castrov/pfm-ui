import { CycleUtils } from './../../../services/cycle.utils';
import { NewProgramComponent } from './new-program-request/new-program-request.component';
import { ProgramAndPrService } from '../../../services/program-and-pr.service';
import { UserUtils } from '../../../services/user.utils';
import { POMService } from '../../../generated/api/pOM.service';
import { Component, OnInit, ViewChild } from '@angular/core';
import {Pom, PB, PBService, RestResult, Program, TOA} from '../../../generated';
import {Notify} from "../../../utils/Notify";
import { ChartSelectEvent, GoogleChartComponent, ChartMouseOutEvent, ChartMouseOverEvent } from 'ng2-google-charts';
import { UiProgramRequest } from './UiProgramRequest';

@Component({
  selector: 'app-select-program-request',
  templateUrl: './select-program-request.component.html',
  styleUrls: ['./select-program-request.component.scss']
})
export class SelectProgramRequestComponent implements OnInit {

  @ViewChild(NewProgramComponent) newProgramComponent: NewProgramComponent;
  private currentCommunityId: string;
  public pom: Pom;
  public pomPrograms: Program[];
  public pb: PB;
  public pbPrograms: Program[];
  public thereAreOutstandingPRs: boolean;
  @ViewChild(GoogleChartComponent) comchart: GoogleChartComponent;
  private chartdata;
  private charty;
  private rowsData: any[];

  constructor(private pomService: POMService,
              private pbService: PBService,
              private programAndPrService: ProgramAndPrService,
              private userUtils: UserUtils,
              private cycleUtils: CycleUtils) {
                this.chartdata = {
                  chartType: 'ColumnChart',
                  dataTable: [],
                  options: { 'title': 'Community TOA' },
                };
                this.charty = [[
                  'Year',
                  'PB 18',
                  'POM 19 TOA',
                  'PRs Submitted',
                  'PRs Planned',
                  'TOA Difference',
                  { role: 'annotation' },
                ]];
              }

  async ngOnInit() {
    this.currentCommunityId = (await this.userUtils.user().toPromise()).currentCommunityId;
    this.initPbPrs();
    this.reloadPrs();
  }

  async reloadPrs() {
    await this.initPomPrs();
    this.thereAreOutstandingPRs = this.pomPrograms.filter(pr => pr.programStatus === 'OUTSTANDING').length > 0;
  }

  initPomPrs(): Promise<void> {
    return new Promise(async (resolve) => {
      this.pom = await this.cycleUtils.currentPom().toPromise();
      this.pomPrograms = (await this.programAndPrService.programRequests(this.pom.id));
      resolve();
      await this.initChart();
    });
  }

  async initPbPrs() {
    this.pb = (await this.pbService.getLatest(this.currentCommunityId).toPromise()).result;
    this.pbPrograms = (await this.programAndPrService.programRequests(this.pb.id));
  }

  onDeletePr() {
    this.reloadPrs();
    this.newProgramComponent.addNewPrForMode = null;
  }

  async submit() {
    let data:RestResult = await this.pomService.submit(this.pom.id).toPromise();
    if (data.error) {
      Notify.error('No Program requests were submitted.\n' + data.error);
    } else {
      Notify.success('All Program requests were submitted.\n' + data.result);
      this.reloadPrs();
    } 
  }

  async initChart() {
    this.populateRowData(this.pom.fy);
    const communityToas = this.pom.communityToas
    for(let i = 0; i < communityToas.length; i++) {
      let prop = communityToas[i].year.toString()
      let bar: any[] = []
      bar.push(prop)
      bar.push(0)
      for(let j = 0; j < this.rowsData.length; j++) {
        bar.push(this.rowsData[j][prop])
      }
      this.charty.push(bar)
    }
    this.chartdata = {
      chartType: 'ColumnChart',
      dataTable: this.charty,
      options: {
        title: 'Community TOA'
      }
    };
  }
  private populateRowData(by: number) {

    let rowdata:any[] = [];
    let row = new Object();
    let sum;

    row["id"] = "PB " + (by-2000-1);
    sum = 0;
    for (let year: number = by; year < by + 5; year++) {
      row[year] = this.aggregateToas(this.pbPrograms, year);
      sum += row[year];
    }
    row["total"] = sum;
    rowdata.push( row );

    row = new Object();
    row["id"] = "POM " + (by-2000) + " TOA";
    sum = 0;
    let toas:any[] = []

    if ( this.pom.communityToas.length>0 ){
      toas = this.pom.communityToas;
    }
    else {
      Object.keys(this.pom.orgToas).forEach(key => {
        this.pom.orgToas[key].forEach( (toa) => toas.push(toa));
      });
    }
    let allocatedToas: { [year: number]: number } = {};
    toas.forEach((toa) => {
      allocatedToas[toa.year] = toa.amount;
      row[toa.year] = toa.amount;
      sum += row[toa.year];
    });

    row["total"] = sum;
    rowdata.push( row );

    row= new Object();
    row["id"] = "PRs Submitted";
    let submittedPRs = this.pomPrograms.filter( (pr:Program) => pr.programStatus=="SUBMITTED" );
    sum = 0;
    for (let year: number = by; year < by + 5; year++) {
      row[year]  = this.aggregateToas(submittedPRs, year);
      sum += row[year];
    }
    row["total"] = sum;
    rowdata.push( row );

    row= new Object();
    row["id"] = "PRs Planned";
    let plannedPRs = this.pomPrograms.filter( (pr:Program) => pr.programStatus!="SUBMITTED" );
    sum = 0;
    for (let year: number = by; year < by + 5; year++) {
      row[year]  = this.aggregateToas(plannedPRs, year);
      sum += row[year];
    }
    row["total"] = sum;
    rowdata.push( row );
    row= new Object();
    row["id"] = "TOA Difference";
    sum = 0;
    let requests: { [year: number]: number } = {};
    for (let year: number = by; year < by + 5; year++) {
      requests[year] = this.aggregateToas(this.pomPrograms, year);
      row[year] = requests[year] - allocatedToas[year];
      sum += row[year];
    }
    row["total"] = sum;
    rowdata.push( row );

    this.rowsData = rowdata;
  }

  private aggregateToas(prs: Program[], year: number): number {
    return prs.map(pr => new UiProgramRequest(pr).getToa(year)).reduce((a, b) => a + b, 0);
  }
}
