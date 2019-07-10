import { Component, OnInit, Input, ViewChild } from '@angular/core';
import { Program, Pom, ProgramStatus } from '../../../generated';
import { GoogleChartComponent, ChartSelectEvent } from 'ng2-google-charts';
import { FilterCriteria, UiProgramRequest } from '../select-program-request/UiProgramRequest';

import * as _ from 'lodash';

@Component({
  selector: 'app-pr-bar-chart',
  templateUrl: './pr-bar-chart.component.html',
  styleUrls: ['./pr-bar-chart.component.scss']
})
export class PrBarChartComponent implements OnInit {
  @ViewChild(GoogleChartComponent) comchart: GoogleChartComponent;
  private _pomPrs: Program[];
  private _pbPrs: Program[];
  private _pom: Pom;
  @Input() private orgmap: Map<string, string>;

  private filterIds: string[];
  private filters: FilterCriteria[] = [FilterCriteria.ALL, FilterCriteria.ORG, FilterCriteria.BA, FilterCriteria.PR_STAT];
  private selectedFilter = FilterCriteria.ALL;
  private chartdata: any;

  constructor() {
  }

  ngOnInit() {
  }

  @Input() set pomPrs(p: Program[]) {
    this._pomPrs = p;
    this.refresh();
  }

  get pomPrs(): Program[] {
    return this._pomPrs;
  }

  @Input() set pbPrs(p: Program[]) {
    this._pbPrs = p;
    this.refresh();
  }

  get pbPrs(): Program[] {
    return this._pbPrs;
  }

  @Input() set pom(p: Pom) {
    this._pom = p;
    this.refresh();
  }

  get pom(): Pom {
    return this._pom;
  }

  private refresh() {
    if (this._pom && this._pbPrs && this._pomPrs) {
      this.selectDistinctFilterIds(this.selectedFilter = FilterCriteria.ALL);
      this.reloadChart("Community TOA", this.pomPrs, this.pbPrs);
    }
  }

  onFilterChange(newFilter: FilterCriteria) {
    this.selectedFilter = newFilter;
    this.selectDistinctFilterIds(this.selectedFilter);
    let filterId = "";
    if (this.filterIds.length > 0) {
      filterId = this.filterIds.pop();
      var pomPrsToChart = this.pomPrs.filter(pr => this.applyFilter(pr, this.selectedFilter, filterId));
      var pbPrsToChart = this.pbPrs.filter(pr => this.applyFilter(pr, this.selectedFilter, filterId));
      this.reloadChart(filterId, pomPrsToChart, pbPrsToChart );
    } else {
      this.selectDistinctFilterIds(this.selectedFilter = FilterCriteria.ALL);
      this.reloadChart("Community TOA", this.pomPrs, this.pbPrs );
    }
  }

  applyFilter(pr: Program, selectedFilter: FilterCriteria, filterId: string): boolean {
    switch (selectedFilter) {
      case FilterCriteria.ORG: return pr.organizationId === filterId;
      case FilterCriteria.BA: return pr.fundingLines[0].baOrBlin === filterId;
      case FilterCriteria.PR_STAT: return pr.programStatus === filterId;
      default: return false;
    }
  }

  getChartTitle(selectedFilter: FilterCriteria, title: string): string {
    switch (selectedFilter) {
      case FilterCriteria.ORG: return "Organization " + this.orgmap.get(title) || title;
      case FilterCriteria.BA: return "BA " + title;
      case FilterCriteria.PR_STAT: return "PRstat " + title;
      default: return "Community TOA";
    }
  }

  selectDistinctFilterIds(selectedFilter: FilterCriteria) {
    switch (selectedFilter) {
      case FilterCriteria.ORG: {
        this.filterIds = _.uniq(_.map(this.pomPrs, 'organizationId'));
        break;
      }
      case FilterCriteria.BA: {
        let allBALines = [];
        this.pomPrs.forEach(pr => {
          pr.fundingLines.forEach(fl => {
            allBALines.push(fl.baOrBlin);
          })
        });
        this.filterIds = _.uniq(allBALines);
        break;
      }
      case FilterCriteria.PR_STAT: {
        this.filterIds = _.uniq(_.map(this.pomPrs, 'programStatus'));
        break;
      }
      default: {
        this.filterIds = [];
        break;
      }
    }

    this.filterIds.sort();
  }

  reloadChart(filterId: string, pomprs: Program[], pbprs: Program[]) {
    this.chartdata = {
      chartType: 'ColumnChart',
      dataTable: this.generateChartTable( filterId, pomprs, pbprs ),
      options: {
        title: this.getChartTitle(this.selectedFilter, filterId ),
        width: 620,
        height: 200,
        legend: { position: 'top', maxLines: 6 },
        bar: { groupWidth: '65%' },
        isStacked: true,
        series: { 0: { color: '#55c57a' }, 1: { color: '#008af3' }, 2: { color: '#cf3fbe' }, 3: { color: '#d70f37' } },
      }
    };
  }

  private generateChartTable(filterId: string, pomprs: Program[], pbprs: Program[]): any[] {
    var charty: any[] = [[
      'Year',
      'PRs Submitted',
      { type: 'string', role: 'tooltip' },
      'PRs Planned',
      { type: 'string', role: 'tooltip' },
      'TOA Difference',
      { type: 'string', role: 'tooltip' },
      'Unallocated',
      { type: 'string', role: 'tooltip' },
    ]];

    var skipUnallocated = ('Community TOA' !== filterId );

    console.log(filterId + ' ' + skipUnallocated);
    var by: number = this.pom.fy;

    var rowdata: any[] = [];
    let row = new Object();
    let sum;

    row["id"] = "PB " + (by - 2000 - 1);
    sum = 0;
    for (let year: number = by; year < by + 5; year++) {
      row[year] = this.aggregateToas(pbprs, year);
      sum += row[year];
    }
    row["total"] = sum;
    rowdata.push(row);

    row = new Object();
    row["id"] = "POM " + (by - 2000) + " TOA";
    sum = 0;
    let toas: any[] = []

    if (this.pom.communityToas.length > 0) {
      toas = this.pom.communityToas;
    }
    else {
      Object.keys(this.pom.orgToas).forEach(key => {
        this.pom.orgToas[key].forEach((toa) => toas.push(toa));
      });
    }
    let allocatedToas: { [year: number]: number } = {};
    toas.forEach((toa) => {
      allocatedToas[toa.year] = toa.amount;
      row[toa.year] = toa.amount;
      sum += row[toa.year];
    });

    row["total"] = sum;
    rowdata.push(row);

    row = new Object();
    row["id"] = "PRs Submitted";
    let submittedPRs = pomprs.filter((pr: Program) => pr.programStatus == ProgramStatus.SUBMITTED);
    sum = 0;
    for (let year: number = by; year < by + 5; year++) {
      row[year] = this.aggregateToas(submittedPRs, year);
      sum += row[year];
    }
    row["total"] = sum;
    rowdata.push(row);

    row = new Object();
    row["id"] = "PRs Planned";
    let plannedPRs = pomprs.filter((pr: Program) => pr.programStatus == ProgramStatus.SAVED);
    sum = 0;
    for (let year: number = by; year < by + 5; year++) {
      row[year] = this.aggregateToas(plannedPRs, year);
      sum += row[year];
    }
    row["total"] = sum;
    rowdata.push(row);

    row = new Object();
    row["id"] = "TOA Difference";
    let outstandingPrs = pomprs.filter((pr: Program) => pr.programStatus == ProgramStatus.OUTSTANDING);
    sum = 0;
    for (let year: number = by; year < by + 5; year++) {
      row[year] = this.aggregateToas(outstandingPrs, year);
      sum += row[year];
    }
    row["total"] = sum;
    rowdata.push(row);

    row = new Object();
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
    rowdata.push(row);

    const communityToas = this.pom.communityToas;
    for (let i = 0; i < communityToas.length; i++) {
      let prop = communityToas[i].year.toString()
      let bar: any[] = []
      bar.push(prop)
      let totalPrevious = ''
      let totalCurrent = ''

      for (let j = 0; j < rowdata.length; j++) {
        if (rowdata[j]['id'] == 'PB ' + (by - 2000 - 1)) {
          totalPrevious = rowdata[j]['id'] + ': ' + this.formatCurrency(rowdata[j][prop])
        }
        else if (rowdata[j]['id'] == 'POM ' + (by - 2000) + ' TOA') {
          totalCurrent = rowdata[j]['id'] + ': ' + this.formatCurrency(rowdata[j][prop])
        }
        if (!(rowdata[j]['id'] == 'PB ' + (by - 2000 - 1) || rowdata[j]['id'] == 'POM ' + (by - 2000) + ' TOA')) {
          bar.push(rowdata[j][prop])
          bar.push(
            totalPrevious
            + '\n'
            + totalCurrent
            + '\n'
            + rowdata[j]['id'] + ': ' + this.formatCurrency(rowdata[j][prop])
          )
        }
      }
      charty.push(bar);
    }

    return charty;
  }

  private aggregateToas(prs: Program[], year: number): number {
    return prs.map(pr => new UiProgramRequest(pr).getToa(year)).reduce((a, b) => a + b, 0);
  }

  private formatCurrency(value) {
    var usdFormat = new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    });
    return usdFormat.format(value);
  }

  select(event: ChartSelectEvent) {
    if ('select' === event.message) {
      let filterId = "";
      if (this.filterIds.length > 0) {
        filterId = this.filterIds.pop();
        var pomPrsToChart = this.pomPrs.filter(pr => this.applyFilter(pr, this.selectedFilter, filterId));
        var pbPrsToChart = this.pbPrs.filter(pr => this.applyFilter(pr, this.selectedFilter, filterId));
        this.reloadChart(filterId, pomPrsToChart, pbPrsToChart);
      } else {
        this.selectDistinctFilterIds(this.selectedFilter = FilterCriteria.ALL);
        this.reloadChart("", this.pomPrs, this.pbPrs);
      }
    }
  }
}
