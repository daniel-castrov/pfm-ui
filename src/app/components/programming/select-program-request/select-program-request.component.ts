import { CycleUtils } from './../../../services/cycle.utils';
import { NewProgramComponent } from './new-program-request/new-program-request.component';
import { ProgramAndPrService } from '../../../services/program-and-pr.service';
import { UserUtils } from '../../../services/user.utils';
import { POMService } from '../../../generated/api/pOM.service';
import { Component, OnInit, ViewChild } from '@angular/core';
import {Pom, PB, PBService, RestResult, Program} from '../../../generated';
import {Notify} from "../../../utils/Notify";
import { ChartSelectEvent, GoogleChartComponent, ChartMouseOutEvent, ChartMouseOverEvent } from 'ng2-google-charts';

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

  constructor(private pomService: POMService,
              private pbService: PBService,
              private programAndPrService: ProgramAndPrService,
              private userUtils: UserUtils,
              private cycleUtils: CycleUtils) {
                this.chartdata = {
                  chartType: 'ColumnChart',
                  dataTable: [],
                  options: { 'title': 'PR' },
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
    console.log('anunay--->', this.pom)
    for(var i = 0; i<5; i++) {
      this.charty.push([
        (this.pom.fy + i).toString(),
        0,
        539,
        539,
        500,
        544,
        542
      ]);
 
    }
     this.chartdata = {
       chartType: 'ColumnChart',
       dataTable: this.charty,
       options: {
         title: 'PR'
       }
     };
  }
}
