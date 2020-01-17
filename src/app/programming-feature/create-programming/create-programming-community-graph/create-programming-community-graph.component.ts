import { Component, Input, OnInit } from '@angular/core';
import { ProgramRequestForPOM } from '../../models/ProgramRequestForPOM';
import { ListItem } from '../../../pfm-common-models/ListItem';

@Component({
  selector: 'pfm-prgramming-community-graph',
  templateUrl: './create-programming-community-graph.component.html',
  styleUrls: ['./create-programming-community-graph.component.scss']
})
export class CreateProgrammingCommunityGraphComponent{

  @Input() griddata:any[];
  chartReady:boolean;

  public columnChart: any =  {
    chartType: 'ColumnChart',
    dataTable: [],
    options: {
      title: 'TOAs for Community',
      width: 200,
      height: 200,
      vAxes: { 0: {format: 'currency'}, 1: {gridlines: {color: 'transparent'}, format:"percent"}},
      seriesType: 'bars',
      series: {0: {targetAxisIndex:0},
               1: {targetAxisIndex:1, type: 'line', color: 'black'}},
      legend: {position:'none'},
      animation: {
        duration: 500,
        easing: 'out',
        startup: true
      }
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
