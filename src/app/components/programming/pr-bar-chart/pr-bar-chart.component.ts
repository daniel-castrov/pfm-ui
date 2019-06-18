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
  private selectedFilter = FilterCriteria.ALL;
  private selectTreeFilter : any = FilterCriteria.ALL;
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
      this.reloadChart("Community TOA", this.pomPrs, this.pbPrs);
      this.reloadTreeChart("Community TOA", this.pomPrs, this.pbPrs);

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
      console.log(pomPrsToChart, "pomPrsToChart");
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
        for (let i = 0; i < title.length; i++)
          this.orgName.push("Organization " + this.orgmap.get(title[i]));
        return this.orgName;
      case FilterCriteria.BA: return "BA " + title;
      case FilterCriteria.PR_STAT: return "PRstat " + title;
      default: return "Community TOA";
    }
  }
  selectDistinctFilterIds(selectedFilter: FilterCriteria) {
    debugger;
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
    this.selectDistinctFilterIds(this.selectTreeFilter);
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
      this.selectDistinctFilterIds(this.selectTreeFilter = FilterCriteria.ALL);
      this.reloadTreeChart("Community TOA", this.pomPrs, this.pbPrs);
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
        this.selectDistinctFilterIds(this.selectTreeFilter = FilterCriteria.ALL);
        this.reloadTreeChart("", this.pomPrs, this.pbPrs);
      }
    }
  }

  reloadTreeChart(filterId: any, pomprs: Program[], pbprs: Program[]) {
    this.treedata = {
      chartType: 'TreeMap',
      dataTable: this.generateTreeMap(filterId, pomprs, pbprs),
      options: {
        title: this.getTreeChartTitle(this.selectTreeFilter, filterId),
        width: 730,
        height: 160,
        legend: { position: 'top', maxLines: 3 },
        bar: { groupWidth: '75%' },
        isStacked: true,
        series: { 0: { color: '#55c57a' }, 1: { color: '#008af3' }, 2: { color: '#cf3fbe' }, 3: { color: '#d70f37' } },
      }
    };
  }

  private generateTreeMap(filterId: string, pomprs: Program[], pbprss: Program[]): any[] {
    var charty: any[] = [["Years", "Parent", "Funds", "Color"], ["Year", null, 0, 0]];

    var skipUnallocated = ('Community TOA' !== filterId);

    console.log(filterId + ' ' + skipUnallocated);
    console.log(pomprs, 'pomPrs');
    console.log(pbprss, 'pbrs');


    var by: number = this.pom.fy;

    var rowdata: any[] = [];
    let row = new Object();
    let sum;
 
    row = new Object();
    // row["id"] = "POM " + (by - 2000) + " TOA";
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
    
  

    console.log(toas, "org");

    let allocatedToas: { [year: number]: number } = {};
    toas.forEach((toa) => {
      allocatedToas[toa.year] = toa.amount;
      row[toa.year] = toa.amount;
      sum += row[toa.year];
    });

    row["total"] = sum;
    rowdata.push(row);
    console.log(rowdata, 'rowdata');
    console.log(this.orgName, 'Org Name');

    // row = new Object();
    // row["id"] = "PRs Submitted";
    // let submittedPRs = pomprs.filter((pr: Program) => pr.programStatus == ProgramStatus.SUBMITTED);
    // sum = 0;
    // for (let year: number = by; year < by + 5; year++) {
    //   row[year] = this.aggregateToas(submittedPRs, year);
    //   sum += row[year];
    // }
    // row["total"] = sum;
    // rowdata.push(row);

    // row = new Object();
    // row["id"] = "PRs Planned";
    // let plannedPRs = pomprs.filter((pr: Program) => pr.programStatus == ProgramStatus.SAVED);
    // sum = 0;
    // for (let year: number = by; year < by + 5; year++) {
    //   row[year] = this.aggregateToas(plannedPRs, year);
    //   sum += row[year];
    // }
    // row["total"] = sum;
    // rowdata.push(row);

    // row = new Object();
    // row["id"] = "TOA Difference";
    // let outstandingPrs = pomprs.filter((pr: Program) => pr.programStatus == ProgramStatus.OUTSTANDING);
    // sum = 0;
    // for (let year: number = by; year < by + 5; year++) {
    //   row[year] = this.aggregateToas(outstandingPrs, year);
    //   sum += row[year];
    // }
    // row["total"] = sum;
    // rowdata.push(row);

    // row = new Object();
    // row["id"] = "Unallocated";
    // sum = 0;
    // for (let year: number = by; year < by + 5; year++) {
    //   let currentFyToa = 0
    //   let toaDifference = 0
    //   let prSubmitted = 0
    //   let prPlanned = 0
    //   rowdata.forEach((row: { year: string, id: string }) => {
    //     if (row.id == "POM " + (by - 2000) + " TOA") currentFyToa = row[year]
    //     if (row.id == 'PRs Planned') prPlanned = row[year]
    //     if (row.id == 'PRs Submitted') prSubmitted = row[year]
    //     if (row.id == 'TOA Difference') toaDifference = row[year]
    //   });
    //   row[year] = (skipUnallocated ? 0 : currentFyToa - toaDifference - prPlanned - prSubmitted);
    //   sum += row[year];
    // }
    // row["total"] = sum;
    // rowdata.push(row);

    const communityToas = this.pom.communityToas;
    for (let i = 0; i < communityToas.length; i++) {
      let prop = communityToas[i].year.toString();
      let amt = communityToas[i].amount;
      let bar: any[] = []
      bar.push(prop);
      bar.push("Year");
      bar.push(amt);
      bar.push(0);

      //   let totalPrevious = ''
      //   let totalCurrent = ''

      //   for (let j = 0; j < rowdata.length; j++) {
      //     if (rowdata[j]['id'] == 'PB ' + (by - 2000 - 1)) {
      //       totalPrevious = rowdata[j]['id'] + ': ' + this.formatCurrency(rowdata[j][prop])
      //     }
      //     else if (rowdata[j]['id'] == 'POM ' + (by - 2000) + ' TOA') {
      //       totalCurrent = rowdata[j]['id'] + ': ' + this.formatCurrency(rowdata[j][prop])
      //     }
      //     if (!(rowdata[j]['id'] == 'PB ' + (by - 2000 - 1) || rowdata[j]['id'] == 'POM ' + (by - 2000) + ' TOA')) {
      //       bar.push(rowdata[j][prop])
      //     }
      //   }
      charty.push(bar);
    }

    if(this.selectTreeFilter == 'Organization'){
    var orgs = this.pom.orgToas;
    console.log(orgs, "orgsdata")
    row = new Object();
    // row["id"] = "POM " + (by - 2000) + " TOA";
    sum = 1;
    for (let i = 0; i < filterId.length; i++) {

      console.log(orgs[filterId[i]]);
      var orgList = orgs[filterId[i]];
      if (skipUnallocated) {
        console.log(orgList, orgList.length, "ok");
        for (let j = 0; j < orgList.length; j++) {
          let bar = [];
          bar.push(orgList[j].year.toString() + "-" + this.orgName[i]);
          bar.push(orgList[j].year.toString());
          bar.push(orgList[j].amount);
          bar.push(sum);
          charty.push(bar);
          sum++;
        }
      }
    }
  }
  if(this.selectTreeFilter == "BA line"){
    var pbprs = [];
    var finalBLine : any =[];
    for(let h=0; h<pbprss.length;h++){
      finalBLine = pbprss[h]
      for(let j=0;j<finalBLine.length;j++)
      pbprs.push(finalBLine[j]);
    }
   
    console.log('ba',pbprs)
    var pbprsData: any = {};
    for (let key in pbprs) {
      for (let key1 in pbprs[key].fundingLines) {
        if (pbprsData[pbprs[key].fundingLines[key1].baOrBlin]) {
          for (let key2 in pbprs[key].fundingLines[key1].funds) {
          if(pbprsData[pbprs[key].fundingLines[key1].baOrBlin][key2]) {
            pbprsData[pbprs[key].fundingLines[key1].baOrBlin][key2]+=pbprs[key].fundingLines[key1].funds[key2];
          }
          else {
            // pbprsData[pbprs[key].fundingLines[key1].baOrBlin][key2] = [];
            pbprsData[pbprs[key].fundingLines[key1].baOrBlin][key2]=pbprs[key].fundingLines[key1].funds[key2];
          }
          }
        }
        else {
          pbprsData[pbprs[key].fundingLines[key1].baOrBlin] = {};
          for (let key2 in pbprs[key].fundingLines[key1].funds) {
            // pbprsData[pbprs[key].fundingLines[key1].baOrBlin][key2] = [];
            pbprsData[pbprs[key].fundingLines[key1].baOrBlin][key2] = (pbprs[key].fundingLines[key1].funds[key2]);
          }
        }
      }
    }
    for(let val in pbprsData){
      console.log(pbprsData[val],val,"value");
      for(let val2 in pbprsData[val]){
        if(parseInt(val2) >= by){
      console.log(val2 ,pbprsData[val][val2],"value2");
      let bar = [];
        bar.push(val+"-"+val2);
        bar.push(val2.toString());
        bar.push(pbprsData[val][val2]);
        bar.push(0);
        charty.push(bar);
        }
      }
    }
  }
console.log("Created array = ", pbprsData);


    console.log(charty);

    return charty;
  }

}
