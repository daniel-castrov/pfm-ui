import { Component, OnInit, Input, ViewChild } from '@angular/core';
import { Program, Pom, ProgramStatus } from '../../../generated';
import { GoogleChartComponent, ChartSelectEvent } from 'ng2-google-charts';
import { FilterCriteria, UiProgramRequest } from '../select-program-request/UiProgramRequest';

import * as _ from 'lodash';
import { OrganizationToaComponent } from '../create-pom-session/organization-toa/organization-toa.component';

@Component({
  selector: 'app-pr-bar-chart',
  templateUrl: './pr-bar-chart.component.html',
  styleUrls: ['./pr-bar-chart.component.scss']
})
export class PrBarChartComponent implements OnInit {
  @ViewChild(GoogleChartComponent) comchart: GoogleChartComponent;
  @ViewChild(GoogleChartComponent) treechart: GoogleChartComponent;

  private _pomPrs: Program[];
  private _pbPrs: Program[];
  private _pom: Pom;
  @Input() private orgmap: Map<string, string>;

  private filterIds: string[];
  private filters: FilterCriteria[] = [FilterCriteria.ALL, FilterCriteria.ORG, FilterCriteria.BA, FilterCriteria.PR_STAT];
  private filtersTreeMap: FilterCriteria[] = [FilterCriteria.ORG, FilterCriteria.BA, FilterCriteria.PR_STAT];

  private selectedFilter = FilterCriteria.ALL;
  private selectTreeFilter: any = FilterCriteria.ORG;
  private chartdata: any;
  private treedata: any;

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
      this.selectDistinctTreeFilterIds(this.selectedFilter = FilterCriteria.ALL);
      this.reloadChart("Community TOA", this.pomPrs, this.pbPrs);
      this.reloadTreeChart(this.filterIds, this.pomPrs, this.pbPrs);

    }
  }
  orgName = [];
  onFilterChange(newFilter: FilterCriteria) {
    this.selectedFilter = newFilter;
    this.selectDistinctFilterIds(this.selectedFilter);
    let filterId = "";
    if (this.filterIds.length > 0) {
      filterId = this.filterIds.pop();
      var pomPrsToChart = this.pomPrs.filter(pr => this.applyFilter(pr, this.selectedFilter, filterId));
      var pbPrsToChart = this.pbPrs.filter(pr => this.applyFilter(pr, this.selectedFilter, filterId));
      this.reloadChart(filterId, pomPrsToChart, pbPrsToChart);
    } else {
      this.selectDistinctFilterIds(this.selectedFilter = FilterCriteria.ALL);
      this.reloadChart("Community TOA", this.pomPrs, this.pbPrs);
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
  getTreeChartTitle(selectTreeFilter: FilterCriteria, title: string): any {
    switch (selectTreeFilter) {
      case FilterCriteria.ORG:
        var orgN = [];
        for (let i = 0; i < title.length; i++)
          orgN.push("Organization " + this.orgmap.get(title[i]));
        return orgN;
        case FilterCriteria.ALL:
          var orgN = [];
          for (let i = 0; i < title.length; i++)
            orgN.push("Organization " + this.orgmap.get(title[i]));
          return orgN;
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

  selectDistinctTreeFilterIds(selectedFilter: FilterCriteria) {
    switch (selectedFilter) {
      case FilterCriteria.ORG: {
        this.filterIds = _.uniq(_.map(this.pomPrs, 'organizationId'));
        break;
      }
      case FilterCriteria.ALL: {
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
    console.log(this.getChartTitle(this.selectedFilter, filterId), 'title');

    this.chartdata = {
      chartType: 'ColumnChart',
      dataTable: this.generateChartTable(filterId, pomprs, pbprs),
      options: {
        title: this.getChartTitle(this.selectedFilter, filterId),
        width: 730,
        height: 160,
        legend: { position: 'top', maxLines: 3 },
        bar: { groupWidth: '75%' },
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
console.log(pomprs,"sjjsjsj");

    var skipUnallocated = ('Community TOA' !== filterId);

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
    console.log(charty,"column");

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

  onFilterChangeForTreeMap(newFilter: FilterCriteria) {

    this.selectTreeFilter = newFilter;
    var pomPrsToChart = [];
    var pbPrsToChart = [];
    this.selectDistinctTreeFilterIds(this.selectTreeFilter);
    // let filterId = "";
    console.log(this.filterIds, 'ff');

    if (this.filterIds.length > 0) {
      for (let i = 0; i < this.filterIds.length; i++) {
        pomPrsToChart.push(this.pomPrs.filter(pr => this.applyFilter(pr, this.selectTreeFilter, this.filterIds[i])));
        pbPrsToChart.push(this.pbPrs.filter(pr => this.applyFilter(pr, this.selectTreeFilter, this.filterIds[i])));
      }
      this.reloadTreeChart(this.filterIds, pomPrsToChart, pbPrsToChart);

      console.log(pomPrsToChart, "pomPrsToChart");

    }
    else {
      this.selectDistinctTreeFilterIds(this.selectTreeFilter = FilterCriteria.ALL);
      this.reloadTreeChart(this.filterIds, this.pomPrs, this.pbPrs);
    }
  }

  selectTree(event: ChartSelectEvent) {
    if ('select' === event.message) {
      let filterId = "";
      var pomPrsToChart = [];
      var pbPrsToChart = [];
      if (this.filterIds.length > 0) {
        for (let i = 0; i < this.filterIds.length; i++) {
          pomPrsToChart.push(this.pomPrs.filter(pr => this.applyFilter(pr, this.selectTreeFilter, this.filterIds[i])));
          pbPrsToChart.push(this.pbPrs.filter(pr => this.applyFilter(pr, this.selectTreeFilter, this.filterIds[i])));
        }
        this.reloadTreeChart(this.filterIds, pomPrsToChart, pbPrsToChart);

      } else {
        this.selectDistinctTreeFilterIds(this.selectTreeFilter = FilterCriteria.ALL);
        this.reloadTreeChart(this.filterIds, this.pomPrs, this.pbPrs);
      }
    }
  }

  reloadTreeChart(filterId: any, pomprs: Program[], pbprs: Program[]) {
  this.orgName = this.getTreeChartTitle(this.selectTreeFilter, filterId),
    this.treedata = {
      chartType: 'TreeMap',
      dataTable: this.generateTreeMap(filterId, pomprs, pbprs),
      options: {
        width: 730,
        height: 400,
        legend: { position: 'top', maxLines: 3 },
        // generateTooltip: this.showStaticTooltip
     }
    };
  }
  // private showStaticTooltip() {
  //   // var all = this.pom.communityToas;
  //   return '<div style="background:#fd9; padding:10px; border-style:solid">' +
  //          'Read more about the <a href="http://en.wikipedia.org/wiki/Kingdom_(biology)">kingdoms of life</a>.</div>';
  // }
  private generateTreeMap(filterId: string, pomprs: Program[], pbprss: Program[]): any[] {
    var charty: any[] = [["Years", "Parent", "Funds", "Color"], ["Year", null, 0, 0]];
   console.log(pomprs,"pomprs");
   console.log(pbprss,"pbprss");
   
   
    var skipUnallocated = ('Community TOA' !== filterId);

    console.log(filterId + ' ' + skipUnallocated);
    var by: number = this.pom.fy;

    var rowdata: any[] = [];
    let row = new Object();
    let sum;

    row = new Object();
    sum = 0;
    let toas: any[] = []
    console.log(this.pom.communityToas, "all");
    console.log(this.pom, "final");
    debugger
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
    var colour =1 ;
    // const communityToas = this.pom.communityToas;
    // for (let i = 0; i < communityToas.length; i++) {
    //   let prop = communityToas[i].year.toString();
    //   let amt = communityToas[i].amount;
    //   let bar: any[] = []
    //   bar.push(prop);
    //   bar.push("Year");
    //   bar.push(amt);
    //   bar.push(colour);
    //   colour++;
    //   charty.push(bar);
    // }

    if (this.selectTreeFilter == 'Organization' || this.selectTreeFilter == 'All') {
      var orgs = this.pom.orgToas;
      console.log(orgs, "orgsdata")
      row = new Object();
      var colour = 1;
      for (let i = 0; i < filterId.length; i++) {

        console.log(orgs[filterId[i]],filterId[i]);
        var orgList = orgs[filterId[i]];
        var sumOrgAmount=0
        if (skipUnallocated) {
          for (let j = 0; j < orgList.length; j++) {
            sumOrgAmount +=(orgList[j].amount);
          }
        }
        let bar = [];
            bar.push(this.orgName[i]);
            bar.push("Year");
            bar.push(sumOrgAmount);
            bar.push(colour);
            charty.push(bar);
            colour++;
      }
    }
    if (this.selectTreeFilter == "BA line") {
      var pbprs = [];
      var finalBLine: any = [];
      for (let h = 0; h < pbprss.length; h++) {
        finalBLine = pbprss[h]
        for (let j = 0; j < finalBLine.length; j++)
          pbprs.push(finalBLine[j]);
      }

      var colour = 1;
      var pbprsData: any = {};
      for (let key in pbprs) {
        for (let key1 in pbprs[key].fundingLines) {
          if (pbprsData[pbprs[key].fundingLines[key1].baOrBlin]) {
            for (let key2 in pbprs[key].fundingLines[key1].funds) {
              if (parseInt(key2) >= by) {
                pbprsData[pbprs[key].fundingLines[key1].baOrBlin] += pbprs[key].fundingLines[key1].funds[key2];
              }
              }
          }
          else {
            pbprsData[pbprs[key].fundingLines[key1].baOrBlin] = {};
            for (let key2 in pbprs[key].fundingLines[key1].funds) {
              if (parseInt(key2) >= by) {
              pbprsData[pbprs[key].fundingLines[key1].baOrBlin] = (pbprs[key].fundingLines[key1].funds[key2]);
              }
            }
          }
        }
      }
      console.log("PBSSSS" ,pbprsData );
      
      for (let val in pbprsData) {
        console.log(val,"vaaalll");
            let bar = [];
            bar.push(val);
            bar.push("Year");
            bar.push(pbprsData[val]);
            bar.push(colour);
            colour++;
            charty.push(bar);

      }
    }

    if (this.selectTreeFilter == "Program Status") {
      var pbprsData: any = {};
      var colour = 1;
      var pmprsData = pomprs[0]
      for (let key in pmprsData) {        
        for (let key1 in pmprsData[key].fundingLines) {
          if (pbprsData[pmprsData[key].programStatus]) {
            for (let key2 in pmprsData[key].fundingLines[key1].funds) {
              if (parseInt(key2) >= by) {
                pbprsData[pmprsData[key].programStatus] += pmprsData[key].fundingLines[key1].funds[key2];
              }
              }
          }
          else {
            pbprsData[pmprsData[key].programStatus] = {};
            var totalProgm = 0;
            for (let key2 in pmprsData[key].fundingLines[key1].funds) {
              if (parseInt(key2) >= by)
              totalProgm += pmprsData[key].fundingLines[key1].funds[key2];
            }
            pbprsData[pmprsData[key].programStatus] = totalProgm;
          }
        }
      }
      console.log("PBSSSS" ,pbprsData );

        for (let val in pbprsData) {
            let bar = [];
            bar.push(val);
            bar.push("Year");
            bar.push(pbprsData[val]);
            bar.push(colour);
            colour++;
            charty.push(bar);
          }
        }
    console.log(charty ,"Tree Map");
    
    return charty;
  }

}
