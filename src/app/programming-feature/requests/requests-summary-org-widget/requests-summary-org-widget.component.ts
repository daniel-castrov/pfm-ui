import { Component, Input, OnInit } from '@angular/core';
import { GoogleChartInterface } from 'ng2-google-charts/google-charts-interfaces';
import { ProgramRequestForPOM } from '../../models/ProgramRequestForPOM';

@Component({
  selector: 'pfm-requests-summary-org-widget',
  templateUrl: './requests-summary-org-widget.component.html',
  styleUrls: ['./requests-summary-org-widget.component.scss']
})
export class RequestsSummaryOrgWidgetComponent  {

  @Input() griddata:ProgramRequestForPOM[];

  chartReady:boolean;

  public columnChart: any =  {
    chartType: 'BarChart',
    dataTable: [
      ['Organization', 'Health', 'Demands'],
      ['JSTO-CBD', 100, 50],
      ['JPEO-CBRND', 99, 48],
      ['JSTO-CBD', 10, 0],
      ['JRO-CBD', 0, 10],
      ['PAIDO-CBD', 70, 0],
      ['DUS..', 0, 60]
    ],
    options: {
      title: 'Organization',
      width: 100,
      height: 100,
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

    console.info("RequestsSummaryOrgWidgetComponent", width, height);
    console.info("Chart", this.columnChart.options.width, this.columnChart.options.height);

    this.columnChart.options.width = width;
    this.columnChart.options.height = height;

    setTimeout(()=>{
      this.chartReady = true;
    }, 200);
  }

}
