import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { GoogleChartInterface } from 'ng2-google-charts/google-charts-interfaces';
import { ProgramSummary } from '../../../models/ProgramSummary';
import { ListItem } from '../../../../pfm-common-models/ListItem';
import { RequestSummaryNavigationHistoryService } from '../requests-summary-navigation-history.service';

@Component({
  selector: 'pfm-requests-summary-toa-widget',
  templateUrl: './requests-summary-toa-widget.component.html',
  styleUrls: ['./requests-summary-toa-widget.component.scss']
})
export class RequestsSummaryToaWidgetComponent implements OnInit {

  @Input() griddata: ProgramSummary[];
  @Input() availableCharts: ListItem[];
  @Output() onChartSwitchEvent: EventEmitter<any> = new EventEmitter<any>();

  chartReady: boolean;
  defaultChart: ListItem;

  public columnChart: any = {
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

  constructor(private requestSummaryNavigationHistoryService: RequestSummaryNavigationHistoryService) { }

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
      if (this.availableCharts[0].name == 'Community Status') {
        this.onChartSwitchEvent.emit({ action: 'Community Status' });
      }
      else if (this.availableCharts[0].name == 'Organization Status') {
        this.onChartSwitchEvent.emit({ action: 'Organization Status' });
      }
      this.loadPreviousSelection();
    }, 200);

    this.defaultChart = this.availableCharts[0];
  }

  loadPreviousSelection() {
    const previousTOAWidget = this.requestSummaryNavigationHistoryService.getSelectedTOAWidget();
    if (previousTOAWidget) {
      const currentTOAWidget = this.availableCharts
        .find(chart => chart.id === previousTOAWidget);
      if (currentTOAWidget) {
        this.defaultChart = currentTOAWidget;
        this.chartSelected(this.defaultChart);
      }
    }
    this.requestSummaryNavigationHistoryService.updateRequestSummaryNavigationHistory({ selectedTOAWidget: this.defaultChart.id });
  }

  private toListItem(years: string[]): ListItem[] {
    let items: ListItem[] = [];
    for (let year of years) {
      let item: ListItem = new ListItem();
      item.id = year;
      item.name = year;
      item.value = year;
      items.push(item);
    }
    return items;
  }

  chartSelected(chartType: any) {
    if (chartType) {
      this.onChartSwitchEvent.emit({ action: chartType.id });
      this.defaultChart = chartType;
    }
    this.requestSummaryNavigationHistoryService.updateRequestSummaryNavigationHistory({ selectedTOAWidget: this.defaultChart.id });
  }
}
