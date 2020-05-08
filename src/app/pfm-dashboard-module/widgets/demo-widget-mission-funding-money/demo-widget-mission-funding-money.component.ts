import { Component, OnInit } from '@angular/core';
import { GoogleChartInterface } from 'ng2-google-charts/ng2-google-charts';

@Component({
  selector: 'app-demo-widget-mission-funding-money',
  templateUrl: './demo-widget-mission-funding-money.component.html',
  styleUrls: ['./demo-widget-mission-funding-money.component.scss']
})
export class DemoWidgetMissionFundingMoneyComponent implements OnInit {
  columnChart: GoogleChartInterface = {
    chartType: 'ColumnChart',
    dataTable: [
      ['Country', 'Performance', 'Profits'],
      ['Germany', 700, 1200],
      ['USA', 300, 600],
      ['Brazil', 400, 500],
      ['Canada', 500, 1000],
      ['France', 600, 1100],
      ['RU', 800, 1000]
    ]
  };

  constructor() {}

  ngOnInit() {}
}
