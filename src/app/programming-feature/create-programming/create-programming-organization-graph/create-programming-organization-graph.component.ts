import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'pfm-programming-organization-graph',
  templateUrl: './create-programming-organization-graph.component.html',
  styleUrls: ['./create-programming-organization-graph.component.scss']
})
export class CreateProgrammingOrganizationGraphComponent{

  @Input() griddata:any[];
  chartReady:boolean;

  public columnChart: any =  {
    chartType: 'ColumnChart',
    dataTable: [
      ['Fiscal Year', 'DUSA-TE', 'PAIO', 'JSTO-CBD', 'JRO-CBRND', 'JPEO-CBRND'],
      ['FY22', 7632, 7577, 128329, 10200, 335440,],
      ['FY23', 7841, 8032, 128593, 10197, 334054,],
      ['FY24', 0, 0, 0, 0, 0,],
      ['FY25', 0, 0, 0, 0, 0,],
      ['FY26', 0, 0, 0, 0, 0,],
    ],
    options: {
      title: 'Sub-TOAs for Organizations',
      width: 1200,
      height: 290,
      isStacked: true,
      animation: {
        duration: 500,
        easing: 'out',
        startup: true
      }
    }
  };

  constructor() { }

  ngOnInit() {
    this.chartReady = true;
  }

  onResize(width:number, height:number):void{
    this.chartReady = false;

    this.columnChart.options.width = width;
    this.columnChart.options.height = height;

    setTimeout(()=>{
      this.chartReady = true;

    }, 200);
  }
}
