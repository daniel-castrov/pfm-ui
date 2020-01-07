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

  public treeMapChart: any =  {
    chartType: 'TreeMap',
    dataTable: [
      ['Program',  'Organization',   'Health',   'Demands'],
      ['All',       null,             0,          0],
      ['JSTO-CBD', 'All', 0, 0],
      ['JPEO-CBRND', 'All', 0, 0],
      ['JRO-CBD', 'All', 0, 0],
      ['PAIDO-CBD', 'All', 0, 0],
      ['DUS', 'All', 0, 0],
      ['SPU',      'JSTO-CBD',     100,        50],
      ['LDN',      'JSTO-CBD',     10,         0],
      ['RUI',    'JPEO-CBRND',   99,         48],
      ['PIP',       'JRO-CBD',      0,          10],
      ['QPM',     'PAIDO-CBD',    70,         0],
      ['WES',           'DUS',          0,          60]
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
    console.info("Chart", this.treeMapChart.options.width, this.treeMapChart.options.height);

    this.treeMapChart.options.width = width;
    this.treeMapChart.options.height = height;

    setTimeout(()=>{
      this.chartReady = true;
    }, 200);
  }

  ngOnInit() {

  }

}
