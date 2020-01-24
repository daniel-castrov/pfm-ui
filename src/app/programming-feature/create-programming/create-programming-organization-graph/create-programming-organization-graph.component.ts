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
    dataTable: [],
    options: {
      title: 'Sub-TOAs for Organizations',
      width: 1400,
      height: 325,
      isStacked: true,
      vAxis: {format: 'currency'},
      animation: {
        duration: 500,
        easing: 'out',
        startup: true
      },
    }
  };

  constructor() { }

  ngOnInit() {
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
