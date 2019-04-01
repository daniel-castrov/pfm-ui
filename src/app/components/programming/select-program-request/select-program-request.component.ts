import {NewProgramComponent} from './new-program-request/new-program-request.component';
import {ProgramAndPrService} from '../../../services/program-and-pr.service';
import {UserUtils} from '../../../services/user.utils';
import {POMService} from '../../../generated/api/pOM.service';
import {Component, OnInit, ViewChild} from '@angular/core';
import { PBService, Pom, Program, RestResult, ProgramStatus} from '../../../generated';
import {Notify} from "../../../utils/Notify";
import { GoogleChartComponent } from 'ng2-google-charts';
import { UiProgramRequest } from './UiProgramRequest';

import {CurrentPhase} from "../../../services/current-phase.service";

@Component({
  selector: 'app-select-program-request',
  templateUrl: './select-program-request.component.html',
  styleUrls: ['./select-program-request.component.scss']
})
export class SelectProgramRequestComponent implements OnInit {
  @ViewChild(NewProgramComponent) newProgramComponent: NewProgramComponent;
  @ViewChild(GoogleChartComponent) comchart: GoogleChartComponent;

  private currentCommunityId: string;
  public pom: Pom;
  public pomPrograms: Program[];
  public pbPrograms: Program[];
  public thereAreOutstandingPRs: boolean;
  private chartdata;
  private charty;
  private rowsData: any[];

  constructor(private pomService: POMService,
              private currentPhase: CurrentPhase,
              private programAndPrService: ProgramAndPrService,
              private userUtils: UserUtils,
              private pbService: PBService ) {}

  async ngOnInit() {
    this.currentCommunityId = (await this.userUtils.user().toPromise()).currentCommunityId;
    this.pom = await this.currentPhase.pom().toPromise();
    await this.initPbPrs(this.pom.fy - 1);
    await this.reloadPrs();
  }

  async reloadPrs() {
    await this.initPomPrs();
    this.thereAreOutstandingPRs = this.pomPrograms.filter(pr => pr.programStatus === 'OUTSTANDING').length > 0;
    const by: number = this.pom.fy;

    await this.initChart();
    await this.loadChart(by);
  }

  initPomPrs(): Promise<void> {
    return new Promise(async (resolve) => {
      //this.pom = await this.currentPhase.pom().toPromise();
      this.pomPrograms = (await this.programAndPrService.programRequests(this.pom.workspaceId));
      resolve();
    });
  }

  async initPbPrs(year:number) {
    this.pbPrograms = (await this.pbService.getFinalByYear(year).toPromise()).result;
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

  async loadChart(by:number) {
    this.populateRowData(by);
    const communityToas = this.pom.communityToas
    for(let i = 0; i < communityToas.length; i++) {
      let prop = communityToas[i].year.toString()
      let bar: any[] = []
      bar.push(prop)
      let totalPrevious = ''
      let totalCurrent = ''
      for(let j = 0; j < this.rowsData.length; j++) {
        if(this.rowsData[j]['id'] == 'PB '+(by-2000-1)) {
          totalPrevious = this.rowsData[j]['id'] + ': ' + this.formatCurrency(this.rowsData[j][prop])
        }
        else if(this.rowsData[j]['id'] == 'POM '+(by-2000)+' TOA') {
          totalCurrent = this.rowsData[j]['id'] + ': ' + this.formatCurrency(this.rowsData[j][prop])
        }
        if(!(this.rowsData[j]['id'] == 'PB '+(by-2000-1) || this.rowsData[j]['id'] == 'POM '+(by-2000)+' TOA')) {
          bar.push(this.rowsData[j][prop])
          bar.push(
            totalPrevious
            + '\n'
            + totalCurrent
            + '\n'
            + this.rowsData[j]['id'] + ': ' + this.formatCurrency(this.rowsData[j][prop])
          )
        }
      }
      this.charty.push(bar);
    }
    this.chartdata = {
      chartType: 'ColumnChart',
      dataTable: this.charty,
      options: {
        title: 'Community TOA',
        width: 720,
        height: 160,
        legend: { position: 'top', maxLines: 3 },
        bar: { groupWidth: '75%' },
        isStacked: true,
        series: {0: {color: '#55c57a'}, 1: {color: '#008af3'}, 2: {color: '#cf3fbe'}, 3: {color: '#d70f37'}},
      }
    };
  }

  async initChart() {
    this.chartdata = {
      chartType: 'ColumnChart',
      dataTable: [],
      options: {
        title: 'Community TOA',
        width: 730,
        height: 160,
        legend: { position: 'top', maxLines: 3 },
        bar: { groupWidth: '75%' },
        isStacked: true,
        series: {0: {color: '#55c57a'}, 1: {color: '#008af3'}, 2: {color: '#cf3fbe'}, 3: {color: '#d70f37'}},
      }
    };
    this.charty = [[
      'Year',
      'PRs Submitted',
      { type: 'string', role: 'tooltip'},
      'PRs Planned',
      { type: 'string', role: 'tooltip'},
      'TOA Difference',
      { type: 'string', role: 'tooltip'},
      'Unallocated',
      { type: 'string', role: 'tooltip'},
    ]];
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
    let submittedPRs = this.pomPrograms.filter( (pr:Program) => pr.programStatus==ProgramStatus.SUBMITTED );
    sum = 0;
    for (let year: number = by; year < by + 5; year++) {
      row[year]  = this.aggregateToas(submittedPRs, year);
      sum += row[year];
    }
    row["total"] = sum;
    rowdata.push( row );

    row= new Object();
    row["id"] = "PRs Planned";
    let plannedPRs = this.pomPrograms.filter( (pr:Program) => pr.programStatus==ProgramStatus.SAVED );
    sum = 0;
    for (let year: number = by; year < by + 5; year++) {
      row[year]  = this.aggregateToas(plannedPRs, year);
      sum += row[year];
    }
    row["total"] = sum;
    rowdata.push( row );

    row = new Object();
    row["id"] = "TOA Difference";
    let outstandingPrs = this.pomPrograms.filter((pr: Program) => pr.programStatus == ProgramStatus.OUTSTANDING);
    sum = 0;
    for (let year: number = by; year < by + 5; year++) {
      row[year] = this.aggregateToas(outstandingPrs, year);
      sum += row[year];
    }
    row["total"] = sum;
    rowdata.push( row );

    row= new Object();
    row["id"] = "Unallocated";
    sum = 0;
    for (let year: number = by; year < by + 5; year++) {
      let currentFyToa = 0
      let toaDifference = 0
      let prSubmitted = 0
      let prPlanned = 0
      rowdata.forEach((row: {year: String, id: String}) =>{
        if(row.id == "POM " + (by-2000) + " TOA") currentFyToa = row[year]
        if(row.id == 'PRs Planned') prPlanned = row[year]
        if(row.id == 'PRs Submitted') prSubmitted = row[year]
        if(row.id == 'TOA Difference') toaDifference = row[year]
      });
      row[year]  = currentFyToa - toaDifference - prPlanned - prSubmitted
      sum += row[year];
    }
    row["total"] = sum;
    rowdata.push( row );

    this.rowsData = rowdata;
  }

  private aggregateToas(prs: Program[], year: number): number {
    return prs.map(pr => new UiProgramRequest(pr).getToa(year)).reduce((a, b) => a + b, 0);
  }

  formatCurrency(value) {
    var usdFormat = new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    });
    return usdFormat.format(value);
  }
}
