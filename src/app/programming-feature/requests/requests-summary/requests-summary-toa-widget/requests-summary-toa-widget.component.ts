import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { GoogleChartInterface } from 'ng2-google-charts/google-charts-interfaces';
import { ProgramSummary } from '../../../models/ProgramSummary';
import { ListItem } from '../../../../pfm-common-models/ListItem';

@Component({
  selector: 'pfm-requests-summary-toa-widget',
  templateUrl: './requests-summary-toa-widget.component.html',
  styleUrls: ['./requests-summary-toa-widget.component.scss']
})
export class RequestsSummaryToaWidgetComponent implements OnInit {

  @Input() griddata:ProgramSummary[];
  @Output() onChartSwitchEvent:EventEmitter<any> = new EventEmitter<any>();

  chartReady:boolean;
  availableCharts: ListItem[];
  defaultChart: ListItem;

  public columnChart: any =  {
    chartType: 'ColumnChart',
    dataTable: [
      ['Fiscal Year', 'PRs Submitted', 'PRs Planned', 'TOA Difference', 'Unallocated'],
      ['FY16', 350001, 200001, 100000, 10000],
      ['FY17', 400001, 300001, 150000, 200000],
      ['FY18', 250001, 400001, 40000, 300000],
      ['FY19', 650001, 6000, 300000, 100000],
      ['FY20', 500001, 70000, 100000, 50000],
      ['FY21', 600000, 200001, 200000, 300000],
    ],
    options: {
      title: 'Community TOA',
      width: 200,
      height: 200,
      isStacked: true,
      vAxis: {format: 'currency'},
      legend: {position: 'top', maxLines: 2},
      animation: {
        duration: 500,
        easing: 'out',
        startup: true
      }
    }
  };

  constructor() { }

  onResize(width:number, height:number):void{
    this.chartReady = false;

    this.columnChart.options.width = width;
    this.columnChart.options.height = height - 40;

    setTimeout(()=>{
      this.chartReady = true;
    }, 200);

  }

  ngOnInit() {
    let chartOptions: string[] = ['Community Status', 'Community TOA Difference', 'Organization Status', 'Organization TOA Difference', 'Funding Line Status'];
    this.availableCharts = this.toListItem(chartOptions);
    this.defaultChart = this.availableCharts[0];
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

  private chartSelected(chartType:any){
    if(chartType){
      this.onChartSwitchEvent.emit({action: chartType.id});
    }
  }
}
