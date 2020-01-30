import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { GoogleChartInterface } from 'ng2-google-charts/google-charts-interfaces';
import { ProgramSummary } from '../../../models/ProgramSummary';
import { ListItem } from '../../../../pfm-common-models/ListItem';

@Component({
  selector: 'pfm-requests-summary-org-widget',
  templateUrl: './requests-summary-org-widget.component.html',
  styleUrls: ['./requests-summary-org-widget.component.scss']
})
export class RequestsSummaryOrgWidgetComponent  {

  @Input() griddata:ProgramSummary[];
  @Output() onChartSwitchEvent:EventEmitter<any> = new EventEmitter<any>();

  currentChart:string;
  chartReady:boolean;
  availableCharts: ListItem[];
  defaultChart: ListItem;

  public treeMapChart: any =  {
    chartType: 'TreeMap',
    dataTable: [
      ['Program', 'Organization', 'Health', 'Demands'],
      ['Organization', null,  0,  0],
      ['JSTO-CBD', 'Organization',  0,  0],
      ['JPEO-CBRND', 'Organization',  0,  0],
      ['JRO-CBD', 'Organization',  0, 0],
      ['PAIDO-CBD', 'Organization',  0,  0],
      ['DUS', 'Organization', 0, 0],
      ['SPU', 'JSTO-CBD', 100, 50],
      ['LDN', 'JSTO-CBD', 10, 0],
      ['RUI', 'JPEO-CBRND', 99, 48],
      ['PIP', 'JRO-CBD', 10, 10],
      ['QPM', 'PAIDO-CBD', 70, 0],
      ['WES', 'DUS', 10, 60]
    ],
    options: {
      width: 200,
      height: 200,
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

    this.treeMapChart.options.width = width;
    this.treeMapChart.options.height = height - 40;

    setTimeout(()=>{
      this.chartReady = true;
    }, 200);
  }

  ngOnInit() {
    let chartOptions: string[] = ['Organization', 'BA Line', 'Program Status'];
    this.availableCharts = this.toListItem(chartOptions);
    this.defaultChart = this.availableCharts[0];
  }

  private chartSelected(chartType:any){
    if(chartType){
      this.onChartSwitchEvent.emit({action: chartType.id});
    }
  }

  private toListItem(years:string[]):ListItem[]{
    let items:ListItem[] = [];
    for(let year of years){
      let item:ListItem = new ListItem();
      item.id = year;
      item.name = year;
      item.value = year;
      items.push(item);
    }
    return items;
  }
}
