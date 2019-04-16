import {NewProgramComponent} from './new-program-request/new-program-request.component';
import {ProgramAndPrService} from '../../../services/program-and-pr.service';
import {UserUtils} from '../../../services/user.utils';
import {POMService} from '../../../generated/api/pOM.service';
import {Component, OnInit, ViewChild, Input} from '@angular/core';
import { PBService, Pom, Program, RestResult, ProgramStatus, OrganizationService} from '../../../generated';
import {Notify} from "../../../utils/Notify";
import { GoogleChartComponent, ChartSelectEvent } from 'ng2-google-charts';
import { UiProgramRequest, FilterCriteria } from './UiProgramRequest';
import  * as _ from 'lodash';

import {CurrentPhase} from "../../../services/current-phase.service";
import { filter } from 'rxjs/operator/filter';
import { ActivatedRoute } from '@angular/router';
import { WorkspaceService } from '../../../generated';
import { Workspace } from '../../../generated';

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
  private charTitle = "";
  private chartdata;
  private charty;
  private rowsData: any[];
  private filterIds: string[];
  private filters: FilterCriteria[];
  private selectedFilter: FilterCriteria;
  private orgMap: Map<string, string> = new Map<string, string>();
  private _currworkspace: Workspace;
  private workspaces: Workspace[];

  constructor(private orgsvc: OrganizationService,
              private pomService: POMService,
              private currentPhase: CurrentPhase,
              private programAndPrService: ProgramAndPrService,
              private userUtils: UserUtils,
              private activatedRoute: ActivatedRoute,
              private wkspsvc: WorkspaceService,
              private pbService: PBService ) {
                this.filters = [FilterCriteria.ALL, FilterCriteria.ORG, FilterCriteria.BA, FilterCriteria.PR_STAT];
                this.selectedFilter = FilterCriteria.ALL;
                this.initChart();
              }

  async ngOnInit() {
    await this.populatreOrgMap();
    this.currentCommunityId = (await this.userUtils.user().toPromise()).currentCommunityId;
    await this.resolvePomAndWorkspaces();
    await this.initPbPrs(this.pom.fy - 1);
    //await this.reloadPrs();
  }

  @Input() set currworkspace(w: Workspace) {
    this._currworkspace = w;
    this.initChart();
    this.reloadPrs();
  }

  get currworkspace(): Workspace {
    return this._currworkspace;
  }

  async reloadPrs() {
    await this.initPomPrs();
    this.thereAreOutstandingPRs = this.pomPrograms.filter(pr => pr.programStatus === 'OUTSTANDING').length > 0;
    const by: number = this.pom.fy;

    //await this.initChart();
    await this.loadChart(by, "");
    await this.selectDistinctFilterIds(this.selectedFilter);
  }

  initPomPrs(): Promise<void> {
    return new Promise(async (resolve) => {
      delete this.pomPrograms;
      this.pomPrograms = (await this.programAndPrService.programRequests(this.currworkspace.id));
      resolve();
    });
  }

  async initPbPrs(year: number) {
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

  
  selectDistinctFilterIds(selectedFilter: FilterCriteria) {
    switch(selectedFilter) {
      case FilterCriteria.ORG : {
        this.filterIds = _.uniq(_.map(this.pomPrograms, 'organizationId'));
        break;
      }
      case FilterCriteria.BA : {
        let allBALines = [];
        this.pomPrograms.forEach(pr => {
          pr.fundingLines.forEach(fl => {
            allBALines.push(fl.baOrBlin);
          })
        });
        this.filterIds = _.uniq(allBALines);
        break;
      }
      case FilterCriteria.PR_STAT : {
        this.filterIds = _.uniq(_.map(this.pomPrograms, 'programStatus'));
        break;
      }
      default: {
        this.filterIds = [];
        break;
      }
    }
  }
  select(event: ChartSelectEvent) {
    if ('select' === event.message) {
      let filterId = "";
      this.initPomPrs();
      if(this.filterIds.length>0) {
        filterId = this.filterIds.pop();
        this.pomPrograms = this.pomPrograms.filter(pr=> this.applyFilter(pr, this.selectedFilter, filterId));
        this.reloadChart(filterId);
      } else {
        this.selectDistinctFilterIds(this.selectedFilter = FilterCriteria.ALL);
        this.reloadChart("");
      }  
    }
    if ('deselect' === event.message) {
      this.reloadPrs();
    }
  }

  reloadChart(title: string) {
    this.charty = [];
    this.initChart();
    this.loadChart(this.pom.fy, title);
  }

  onFilterChange(newFilter: FilterCriteria) {
    this.selectedFilter = newFilter;
    this.selectDistinctFilterIds(this.selectedFilter);
    let filterId = "";
    this.initPomPrs().then(() => { 
      if (this.filterIds.length > 0) {
        filterId = this.filterIds.pop();
        this.pomPrograms = this.pomPrograms.filter(pr => this.applyFilter(pr, this.selectedFilter, filterId));
        this.reloadChart(filterId);
      } else {
        this.selectDistinctFilterIds(this.selectedFilter = FilterCriteria.ALL);
        this.reloadChart("");
      }
    });
  }

  applyFilter(pr: Program, selectedFilter: FilterCriteria, filterId: string): boolean {
    switch(selectedFilter) {
      case FilterCriteria.ORG : return pr.organizationId===filterId;
      case FilterCriteria.BA : return pr.fundingLines[0].baOrBlin===filterId;
      case FilterCriteria.PR_STAT : return pr.programStatus===filterId;
      default: return false;
    }
  }

  getChartTitle(selectedFilter: FilterCriteria, title: string): string {
    switch(selectedFilter) {
      case FilterCriteria.ORG : return "Organization " +  this.orgMap.get(title) || title;
      case FilterCriteria.BA : return "BA " + title;
      case FilterCriteria.PR_STAT : return "PRstat " + title;
      default: return "Community TOA";
    }
  }

  async loadChart(by:number, title: string) {
    this.populateRowData(by, 'Community TOA' !== title);
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
        title: this.getChartTitle(this.selectedFilter, title),
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
        title: this.getChartTitle(this.selectedFilter, ""),
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

  private populateRowData(by: number, skipUnallocated: boolean = false) {
    let rowdata: any[] = [];
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
      rowdata.forEach((row: { year: string, id: string }) => {
        if (row.id == "POM " + (by - 2000) + " TOA") currentFyToa = row[year]
        if (row.id == 'PRs Planned') prPlanned = row[year]
        if (row.id == 'PRs Submitted') prSubmitted = row[year]
        if (row.id == 'TOA Difference') toaDifference = row[year]
      });
      row[year] = (skipUnallocated ? 0 : currentFyToa - toaDifference - prPlanned - prSubmitted);
      sum += row[year];
    }
    row["total"] = sum;
    rowdata.push( row );
    this.rowsData = rowdata;
  }

  private aggregateToas(prs: Program[], year: number): number {
    if (!prs) {
      return 0;
    }
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

  private async populatreOrgMap() {
    this.userUtils.user().subscribe(user => {
      this.orgsvc.getByCommunityId(user.currentCommunityId).subscribe(data => {

        let orgs = [];
        this.orgMap.clear();
        orgs = data.result;
        orgs.forEach(org => this.orgMap.set(org.id, org.abbreviation));
      });
    });
  }

  private async resolvePomAndWorkspaces(): Promise<void> {
    // if we get a workspaceId as part of the route, fetch that workspace, and
    // set the pom according to the workspace.
    // if we don't get a workspaceId in the route, then fetch the current pom
    // and set the workspace based on the pom.

    var workspaceId;
    return new Promise<void>((resolve, reject) => {
      this.activatedRoute.params.subscribe(params => { 
        if (params.workspaceId) {
          workspaceId = params.workspaceId;
          this.pomService.getByWorkspaceId(params.workspaceId).subscribe(d => { 
            if (d.error) {
              reject(d.error);
            }
            this.pom = d.result;
            resolve();
          });
        }
        else {
          this.currentPhase.pom().subscribe(p => { 
            this.pom = p;
            workspaceId = p.workspaceId;
            resolve();
          });
        }
      });
    }).then(() => { 
      return new Promise<void>((resolve, reject) => { 
        this.wkspsvc.getByPhaseId(this.pom.id).subscribe(d => { 
          if (d.error) {
            reject(d.error);
          }

          this.workspaces = d.result;
          this.currworkspace = this.workspaces.filter(wksp => wksp.id === workspaceId)[0];
          resolve();
        });
      });
    });
  }
}
