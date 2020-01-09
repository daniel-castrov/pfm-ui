import { Component, Input, OnInit } from '@angular/core';
import { GoogleChartInterface } from 'ng2-google-charts/google-charts-interfaces';
import { ProgramRequestForPOM } from '../../models/ProgramRequestForPOM';

@Component({
  selector: 'pfm-requests-summary-toa-widget',
  templateUrl: './requests-summary-toa-widget.component.html',
  styleUrls: ['./requests-summary-toa-widget.component.scss']
})
export class RequestsSummaryToaWidgetComponent implements OnInit {

  @Input() griddata:ProgramRequestForPOM[];

  chartReady:boolean;

  public columnChart: any =  {
    chartType: 'ColumnChart',
    dataTable: [
      ['Fiscal Year', 'Funds'],
      ['FY16', 450001],
      ['FY17', 400001],
      ['FY18', 250001],
      ['FY19', 650001],
      ['FY20', 500001],
      ['FY21', 600000]
    ],
    options: {
      title: 'Community TOA',
      width: 700,
      height: 300,
      animation: {
        duration: 1000,
        easing: 'out',
        startup: true
      }
    }
  };

  constructor() { }

  onResize(width:number, height:number):void{
    this.chartReady = false;
    console.info("RequestsSummaryToaWidgetComponent", width, height);
    console.info("Chart", this.columnChart.options.width, this.columnChart.options.height);

    this.columnChart.options.width = width;
    this.columnChart.options.height = height;

    setTimeout(()=>{
      this.chartReady = true;
    }, 200);

  }

  ngOnInit() {

  }

}
