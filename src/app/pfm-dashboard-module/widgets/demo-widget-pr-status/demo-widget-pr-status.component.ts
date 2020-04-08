import { Component, OnInit } from '@angular/core';
import { GoogleChartInterface } from 'ng2-google-charts/ng2-google-charts';

@Component({
  selector: 'app-demo-widget-pr-status',
  templateUrl: './demo-widget-pr-status.component.html',
  styleUrls: ['./demo-widget-pr-status.component.scss']
})
export class DemoWidgetPrStatusComponent implements OnInit {
  columnChart2: GoogleChartInterface = {
    chartType: 'ColumnChart',
    dataTable: [
      ['Country', 'Performance', 'Profits'],
      ['Germany', 0, 0],
      ['USA', 0, 0],
      ['Brazil', 0, 0],
      ['Canada', 0, 0],
      ['France', 0, 0],
      ['RU', 0, 0]
    ],
    options: {
      title: 'Countries',
      animation: {
        duration: 1000,
        easing: 'out',
        startup: true
      }
    }
  };

  constructor() {}

  ngOnInit() {}
}
