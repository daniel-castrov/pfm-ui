import { Component, Input, OnInit } from '@angular/core';
import { ProgramRequestForPOM } from '../../models/ProgramRequestForPOM';
import { ListItem } from '../../../pfm-common-models/ListItem';

@Component({
  selector: 'pfm-prgramming-community-graph',
  templateUrl: './create-programming-community-graph.component.html',
  styleUrls: ['./create-programming-community-graph.component.scss']
})
export class CreateProgrammingCommunityGraphComponent{

  @Input() griddata:ProgramRequestForPOM[];
  chartReady:boolean;

  public columnChart: any =  {
    chartType: 'ColumnChart',
    dataTable: [
      ['Fiscal Year', 'PRs Submitted', 'Average',],
      ['FY19', 540000, .53],
      ['FY20', 545000, .54],
      ['FY21', 510000, .50],
      ['FY22', 490000, .51],
      ['FY23', 461000, .49],
    ],
    options: {
      title: 'TOAs for Community',
      width: 200,
      height: 200,
      vAxes: { 1: {gridlines: {color: 'transparent'}, format:"#%"},},
      seriesType: 'bars',
      series: {1: {targetAxisIndex:1, type: 'line', color: 'black'}},
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
    console.info("RequestsSummaryToaWidgetComponent", width, height);
    console.info("Chart", this.columnChart.options.width, this.columnChart.options.height);

    this.columnChart.options.width = width;
    this.columnChart.options.height = height;

    setTimeout(()=>{
      this.chartReady = true;

    }, 200);

  }
}
