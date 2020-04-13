import { Component, Input, OnInit } from '@angular/core';
import { ProgramSummary } from '../../../models/ProgramSummary';
import { ListItem } from '../../../../pfm-common-models/ListItem';
import { RequestSummaryNavigationHistoryService } from '../requests-summary-navigation-history.service';
import { ProgrammingModel } from '../../../models/ProgrammingModel';
import { AppModel } from '../../../../pfm-common-models/AppModel';

@Component({
  selector: 'pfm-requests-summary-toa-widget',
  templateUrl: './requests-summary-toa-widget.component.html',
  styleUrls: ['./requests-summary-toa-widget.component.scss']
})
export class RequestsSummaryToaWidgetComponent implements OnInit {
  @Input() griddata: ProgramSummary[];
  @Input() availableCharts: ListItem[];
  @Input() pomYear: number;
  @Input() programmingModel: ProgrammingModel;
  @Input() selectedOrg: ListItem;

  chartReady: boolean;
  defaultChart: ListItem;

  columnChart: any = {
    chartType: 'ColumnChart',
    dataTable: [],
    options: {
      title: 'Community TOA',
      width: 200,
      height: 200,
      isStacked: true,
      vAxis: { format: 'currency' },
      legend: { position: 'top', maxLines: 2 },
      animation: {
        duration: 500,
        easing: 'out',
        startup: true
      }
    }
  };

  constructor(
    private appModel: AppModel,
    private requestSummaryNavigationHistoryService: RequestSummaryNavigationHistoryService
  ) {}

  onResize(width: number, height: number): void {
    this.chartReady = false;

    this.columnChart.options.width = width;
    this.columnChart.options.height = height - 40;

    setTimeout(() => {
      this.chartReady = true;
    }, 200);
  }

  ngOnInit() {
    this.chartReady = false;
    setTimeout(() => {
      if (this.availableCharts[0].name === 'Community Status') {
        this.onChartSelected({ name: 'Community Status' });
      } else if (this.availableCharts[0].name === 'Organization Status') {
        this.onChartSelected({ name: 'Organization Status' });
      }
      this.loadPreviousSelection();
    }, 200);
    this.defaultChart = this.availableCharts[0];
  }

  loadPreviousSelection() {
    const previousTOAWidget = this.requestSummaryNavigationHistoryService.getSelectedTOAWidget();
    if (previousTOAWidget) {
      const currentTOAWidget = this.availableCharts.find(chart => chart.id === previousTOAWidget);
      if (currentTOAWidget) {
        this.defaultChart = currentTOAWidget;
        this.onChartSelected(this.defaultChart);
      }
    }
    this.requestSummaryNavigationHistoryService.updateRequestSummaryNavigationHistory({
      selectedTOAWidget: this.defaultChart.id
    });
  }

  private toListItem(years: string[]): ListItem[] {
    const items: ListItem[] = [];
    for (const year of years) {
      const item: ListItem = new ListItem();
      item.id = year;
      item.name = year;
      item.value = year;
      items.push(item);
    }
    return items;
  }

  onChartSelected(chartType: any) {
    if (chartType) {
      this.defaultChart = chartType;
      if (chartType.name === 'Community Status') {
        this.toaChartCommunityStatus();
      } else if (chartType.name === 'Community TOA Difference') {
        this.toaChartCommunityToaDifference();
      } else if (chartType.name === 'Organization Status') {
        this.toaChartOrganizationStatus();
      } else if (chartType.name === 'Organization TOA Difference') {
        this.toaChartOrganizationToaDifference();
      } else if (chartType.name === 'Funding Line Status') {
        this.toaChartFundingLineStatus();
      }
    }
    this.requestSummaryNavigationHistoryService.updateRequestSummaryNavigationHistory({
      selectedTOAWidget: this.defaultChart.id
    });
  }

  toaChartCommunityStatus() {
    this.chartReady = false;
    // Set options
    this.setStatusChartOptions();
    this.columnChart.options.title = 'Community Status';
    // get data from grid
    const rows: any = this.calculateSummary();
    // Set data header
    const data: any[] = [
      ['Fiscal Year', 'TOA', 'Approved by Me', 'Rejected by Me', 'Saved by Me', 'Outstanding for Me', 'Not in My Queue']
    ];
    for (let i = 0; i < 5; i++) {
      const year: string = 'FY' + (this.pomYear + i - 2000);
      const toa: number = this.programmingModel.pom.communityToas[i].amount;
      const approved = rows[this.pomYear + i].approved;
      const rejected = rows[this.pomYear + i].rejected;
      const saved = rows[this.pomYear + i].saved;
      const outstanding = rows[this.pomYear + i].outstanding;
      const notMine = rows[this.pomYear + i].notMine;
      data.push([year, toa, approved, rejected, saved, outstanding, notMine]);
    }
    // set data to char and refresh
    this.columnChart.dataTable = data;
    this.columnChart = Object.assign({}, this.columnChart);
    this.chartReady = true;
  }

  toaChartCommunityToaDifference() {
    this.chartReady = false;
    // Set char options
    this.setDifferenceChartOptions();
    this.columnChart.options.title = 'Community TOA Difference';
    // Calculate totals
    const totals: any[] = this.calculateTotals();
    // Set data header
    const data: any = [['Fiscal Year', 'TOA Difference']];
    // Add difference to data
    for (let i = 0; i < 5; i++) {
      const year: string = 'FY' + (totals[i].year - 2000);
      const difference: number = totals[i].amount - this.programmingModel.pom.communityToas[i].amount;
      data.push([year, difference]);
    }
    // Set data to char and refresh
    this.columnChart.dataTable = data;
    this.columnChart = Object.assign({}, this.columnChart);
    this.chartReady = true;
  }

  toaChartOrganizationStatus() {
    this.chartReady = false;
    // set options
    this.setStatusChartOptions();
    this.columnChart.options.title = this.selectedOrg.name + ' Organization Status';
    // get data from grid
    const rows: any = this.calculateSummary();
    // set data header
    const data: any[] = [
      ['Fiscal Year', 'TOA', 'Approved by Me', 'Rejected by Me', 'Saved by Me', 'Outstanding for Me', 'Not in My Queue']
    ];
    for (let i = 0; i < 5; i++) {
      const year: string = 'FY' + (this.pomYear + i - 2000);
      const toa: number = this.programmingModel.pom.orgToas[this.selectedOrg.value][i].amount;
      const approved = rows[this.pomYear + i].approved;
      const rejected = rows[this.pomYear + i].rejected;
      const saved = rows[this.pomYear + i].saved;
      const outstanding = rows[this.pomYear + i].outstanding;
      const notMine = rows[this.pomYear + i].notMine;
      data.push([year, toa, approved, rejected, saved, outstanding, notMine]);
    }
    // set data to char and refresh
    this.columnChart.dataTable = data;
    this.columnChart = Object.assign({}, this.columnChart);
    this.chartReady = true;
  }

  toaChartOrganizationToaDifference() {
    this.chartReady = false;
    // Set options
    this.setDifferenceChartOptions();
    this.columnChart.options.title = this.selectedOrg.name + ' TOA Difference';
    // Calculate totals
    const totals: any[] = this.calculateTotals();
    // Set data header
    const data: any = [['Fiscal Year', 'TOA Difference']];
    // Add difference to data
    for (let i = 0; i < 5; i++) {
      const year: string = 'FY' + (totals[i].year - 2000);
      const difference: number = totals[i].amount - this.programmingModel.pom.orgToas[this.selectedOrg.value][i].amount;
      data.push([year, difference]);
    }
    // Set data to char and refresh
    this.columnChart.dataTable = data;
    this.columnChart = Object.assign({}, this.columnChart);
    this.chartReady = true;
  }

  toaChartFundingLineStatus() {}

  // Used to calculate total funds per year
  private calculateTotals(): any[] {
    const totals: any[] = [];
    for (const row of this.griddata) {
      for (let i = 0; i < 5; i++) {
        const year = this.pomYear + i;
        if (!totals[i]) {
          totals[i] = { year, amount: 0 };
        }
        if (row.funds[this.pomYear + i]) {
          totals[i].amount = totals[i].amount + row.funds[year];
        }
      }
    }
    return totals;
  }

  // Used to calculate summary data per year per status and user role
  private calculateSummary(): any {
    const rows: any = {};
    for (const row of this.griddata) {
      for (let i = 0; i < 5; i++) {
        const year = this.pomYear + i;
        if (!rows[year]) {
          rows[year] = { approved: 0, rejected: 0, saved: 0, outstanding: 0, notMine: 0 };
        }
        const programTotal: number = row.funds[year];
        // place total in correct value.
        if (this.appModel.userDetails.roles.includes(row.assignedTo)) {
          if (row.status === 'APPROVED') {
            rows[year].approved = rows[year].approved + programTotal;
          } else if (row.status === 'REJECTED') {
            rows[year].rejected = rows[year].rejected + programTotal;
          } else if (row.status === 'SAVED') {
            rows[year].saved = rows[year].saved + programTotal;
          } else if (row.status === 'OUTSTANDING') {
            rows[year].outstanding = rows[year].outstanding + programTotal;
          }
        } else {
          rows[year].notMine = rows[year].notMine + programTotal;
        }
      }
    }
    return rows;
  }

  // Sets difference chart
  private setDifferenceChartOptions() {
    const width: any = this.columnChart.options.width;
    const height: any = this.columnChart.options.height;
    // Set chart type
    this.columnChart.chartType = 'ColumnChart';
    // Set options
    this.columnChart.options = {
      title: this.selectedOrg.name + ' TOA Difference',
      width,
      height,
      vAxis: { format: 'currency' },
      legend: { position: 'none' },
      animation: {
        duration: 500,
        easing: 'out',
        startup: true
      }
    };
  }

  private setStatusChartOptions() {
    const width: any = this.columnChart.options.width;
    const height: any = this.columnChart.options.height;
    // Set chart type
    this.columnChart.chartType = 'ColumnChart';
    // Set Options
    this.columnChart.options = {
      vAxis: { format: 'currency' },
      isStacked: true,
      width,
      height,
      chartArea: { left: 80, top: 30, bottom: 20, right: 170, width: '100%', height: '100%' },
      seriesType: 'bars',
      series: { 0: { type: 'line' } },
      colors: ['#00008B', '#008000', '#FF0000', '#FFA500', '#FFFA5C', '#88B8B4'],
      animation: {
        duration: 500,
        easing: 'out',
        startup: true
      }
    };
  }
}
