import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'pfm-programming-community-graph',
  templateUrl: './create-programming-community-graph.component.html',
  styleUrls: ['./create-programming-community-graph.component.scss']
})
export class CreateProgrammingCommunityGraphComponent implements OnInit {
  chartReady: boolean;

  columnChart: any = {
    chartType: 'ColumnChart',
    dataTable: [],
    options: {
      title: 'TOAs for Community',
      width: 1400,
      height: 325,
      vAxes: { 0: { format: 'currency' }, 1: { gridlines: { color: 'transparent' }, format: 'percent' } },
      seriesType: 'bars',
      series: { 0: { targetAxisIndex: 0 }, 1: { targetAxisIndex: 1, type: 'line', color: 'black' } },
      legend: { position: 'none' },
      animation: {
        duration: 500,
        easing: 'out',
        startup: true
      }
    }
  };

  constructor() {}

  ngOnInit() {}

  onResize(width: number, height: number): void {
    this.chartReady = false;

    this.columnChart.options.width = width;
    this.columnChart.options.height = height;

    setTimeout(() => {
      this.chartReady = true;
    }, 200);
  }
}
