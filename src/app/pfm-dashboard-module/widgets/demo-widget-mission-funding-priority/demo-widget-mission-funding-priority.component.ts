import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-demo-widget-mission-funding-priority',
  templateUrl: './demo-widget-mission-funding-priority.component.html',
  styleUrls: ['./demo-widget-mission-funding-priority.component.scss']
})
export class DemoWidgetMissionFundingPriorityComponent implements OnInit {
  gaugeChart = {
    chartType: 'Gauge',
    dataTable: [
      ['Label', 'Value'],
      ['Value', 1.78]
    ],
    options: {
      animation: { easing: 'out' },
      width: 150,
      height: 150,
      greenFrom: 1,
      greenTo: 4,
      minorTicks: 5,
      min: 0,
      max: 5,
      majorTicks: ['0', '1', '2', '3', '4', '5'],
      greenColor: '#d0e9c6'
    }
  };

  constructor() {}

  ngOnInit() {}
}
