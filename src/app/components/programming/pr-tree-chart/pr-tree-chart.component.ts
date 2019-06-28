import { Component, OnInit, Input, ViewChild, Output, EventEmitter } from '@angular/core';
import { Program, Pom, ProgramStatus } from '../../../generated';
import { GoogleChartComponent, ChartSelectEvent } from 'ng2-google-charts';
import { FilterCriteria, UiProgramRequest } from '../select-program-request/UiProgramRequest';

import * as _ from 'lodash';
import { OrganizationToaComponent } from '../create-pom-session/organization-toa/organization-toa.component';
import { NewProgramComponent } from '../select-program-request/new-program-request/new-program-request.component';

@Component({
  selector: 'app-pr-tree-chart',
  templateUrl: './pr-tree-chart.component.html',
  styleUrls: ['./pr-tree-chart.component.scss']
})
export class PrTreeChartComponent implements OnInit {

  @ViewChild(GoogleChartComponent) comchart: GoogleChartComponent;
  @ViewChild(GoogleChartComponent) treechart: GoogleChartComponent;

  private _pomPrs: Program[];
  private _pbPrs: Program[];
  private _pom: Pom;
  @Input() private orgmap: Map<string, string>;
  private pomD: Program[];
  private pbD: Program[];
  private filterIds: string[];
  private filters: FilterCriteria[] = [FilterCriteria.ALL, FilterCriteria.ORG, FilterCriteria.BA, FilterCriteria.PR_STAT];
  private filtersTreeMap: FilterCriteria[] = [FilterCriteria.ORG, FilterCriteria.BA, FilterCriteria.PR_STAT];

  private selectedFilter = FilterCriteria.ALL;
  private selectTreeFilter: any = FilterCriteria.ORG;
  private chartdata: any;
  private treedata: any;
  @ViewChild(NewProgramComponent) newProgramComponent: NewProgramComponent;
  @Output() updatedDataEvent = new EventEmitter<string>();

  constructor() {
  }

  ngOnInit() {
  }
  sendUpdatedData(pomData) {
    this.updatedDataEvent.emit(pomData)
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
  onDeletePr() {
    this.newProgramComponent.addNewPrForMode = null;
  }
  private refresh() {
    if (this._pom && this._pbPrs && this._pomPrs) {
      this.selectDistinctTreeFilterIds(this.selectedFilter = FilterCriteria.ALL);
      this.reloadTreeChart(this.filterIds, this.pomPrs, this.pbPrs);
    }
  }
  orgName = [];

  applyFilter(pr: Program, selectedFilter: FilterCriteria, filterId: string): boolean {
    switch (selectedFilter) {
      case FilterCriteria.ORG: return pr.organizationId === filterId;
      case FilterCriteria.BA: return pr.fundingLines[0].baOrBlin === filterId;
      case FilterCriteria.PR_STAT: return pr.programStatus === filterId;
      default: return false;
    }
  }
  getTreeChartTitle(selectTreeFilter: FilterCriteria, title: string): any {
    switch (selectTreeFilter) {
      case FilterCriteria.ORG:
        var orgN = [];
        for (let i = 0; i < title.length; i++)
          orgN.push(this.orgmap.get(title[i]));
        return orgN;
      case FilterCriteria.ALL:
        var orgN = [];
        for (let i = 0; i < title.length; i++)
          orgN.push(this.orgmap.get(title[i]));
        return orgN;
      case FilterCriteria.BA: return "BA " + title;
      case FilterCriteria.PR_STAT: return "PRstat " + title;
      default: return "Community TOA";
    }
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


  private formatCurrency(value) {
    var usdFormat = new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    });
    return usdFormat.format(value);
  }

  onFilterChangeForTreeMap(newFilter: FilterCriteria) {
    this.selectTreeFilter = newFilter;
    var pomPrsToChart = [];
    var pbPrsToChart = [];
    this.selectDistinctTreeFilterIds(this.selectTreeFilter);
    if (this.filterIds.length > 0) {
      for (let i = 0; i < this.filterIds.length; i++) {
        pomPrsToChart.push(this.pomPrs.filter(pr => this.applyFilter(pr, this.selectTreeFilter, this.filterIds[i])));
        pbPrsToChart.push(this.pbPrs.filter(pr => this.applyFilter(pr, this.selectTreeFilter, this.filterIds[i])));
      }
      this.reloadTreeChart(this.filterIds, pomPrsToChart, pbPrsToChart);
    }
    else {
      this.selectDistinctTreeFilterIds(this.selectTreeFilter = FilterCriteria.ALL);
      this.reloadTreeChart(this.filterIds, this.pomPrs, this.pbPrs);
    }
  }


  selectTree(event: ChartSelectEvent) {
    var selectedRow = event.selectedRowValues[0];
    let filterId = "";
    if ('select' === event.message) {
      if (selectedRow == "Organization" || selectedRow == "BA line" || selectedRow == "Program Status") {
        this.pomD = this.pomPrs;
        this.pbD = this.pbPrs;
      }
      else {
        if (this.filterIds.length > 0) {
          if (this.selectTreeFilter == 'Organization') {
            for (let orgs = 0; orgs < this.orgName.length; orgs++) {
              if (this.orgName[orgs] == selectedRow)
                filterId = this.filterIds[orgs];
            }
          }
          else {
            filterId = selectedRow;
          }
          var pomPrsToChart = this.pomPrs.filter(pr => this.applyFilter(pr, this.selectTreeFilter, filterId));
          this.pomD = pomPrsToChart;
          var pbPrsToChart = this.pbPrs.filter(pr => this.applyFilter(pr, this.selectTreeFilter, filterId));
          this.pbD = pbPrsToChart;
        } else {
          this.selectDistinctTreeFilterIds(this.selectTreeFilter = FilterCriteria.ALL);
        }
      }
    }
    this.sendUpdatedData({ pom: this.pomD, pb: this.pbD });
  }

  reloadTreeChart(filterId: any, pomprs: Program[], pbprs: Program[]) {
    this.orgName = this.getTreeChartTitle(this.selectTreeFilter, filterId),
      this.treedata = {
        chartType: 'TreeMap',
        dataTable: this.generateTreeMap(filterId, pomprs, pbprs),
        options: {
          width: 700,
          height: 350,
          legend: { po8ition: 'top', maxLines: 3 },
        }
      };
  }
  private generateTreeMap(filterId: string, pomprs: Program[], pbprss: Program[]): any[] {
    var charty: any[] = [];
    var skipUnallocated = ('Community TOA' !== filterId);
console.log(pomprs);
console.log(pbprss);


    console.log(filterId + ' ' + skipUnallocated);
    var by: number = this.pom.fy;

    var rowdata: any[] = [];
    let row = new Object();
    let sum;

    row = new Object();
    sum = 0;
    let toas: any[] = [];

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
    var colour = 1;

    if (this.selectTreeFilter == 'Organization' || this.selectTreeFilter == 'All') {
      var charty: any[] = [["Years", "Parent", "Funds", "Color"], ["Organization", null, 0, 0]];
      var orgs = this.pom.orgToas;
      row = new Object();
      var colour = 1;
      for (let i = 0; i < filterId.length; i++) {
        var orgList = orgs[filterId[i]];
        var sumOrgAmount = 0
        if (skipUnallocated) {
          for (let j = 0; j < orgList.length; j++) {
            sumOrgAmount += (orgList[j].amount);
          }
        }
        let bar = [];
        bar.push(this.orgName[i]);
        bar.push("Organization");
        bar.push(sumOrgAmount);
        bar.push(colour);
        charty.push(bar);
        colour++;
      }
    }
    if (this.selectTreeFilter == "BA line") {
      var charty: any[] = [["Years", "Parent", "Funds", "Color"], ["BA line", null, 0, 0]];
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

      for (let val in pbprsData) {
        let bar = [];
        bar.push(val);
        bar.push("BA line");
        bar.push(pbprsData[val]);
        bar.push(colour);
        colour++;
        charty.push(bar);

      }
    }

    if (this.selectTreeFilter == "Program Status") {
      var charty: any[] = [["Years", "Parent", "Funds", "Color"], ["Program Status", null, 0, 0]];
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

      for (let val in pbprsData) {
        let bar = [];
        bar.push(val);
        bar.push("Program Status");
        bar.push(pbprsData[val]);
        bar.push(colour);
        colour++;
        charty.push(bar);
      }
    }

    return charty;
  }
}


