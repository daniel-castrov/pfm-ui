import { Component, Input, OnInit } from '@angular/core';
import { GoogleChartInterface } from 'ng2-google-charts/google-charts-interfaces';
import { ProgramRequestForPOM } from '../../models/ProgramRequestForPOM';
import { ListItem } from '../../../pfm-common-models/ListItem';

@Component({
  selector: 'pfm-requests-summary-toa-widget',
  templateUrl: './requests-summary-toa-widget.component.html',
  styleUrls: ['./requests-summary-toa-widget.component.scss']
})
export class RequestsSummaryToaWidgetComponent implements OnInit {

  @Input() griddata:ProgramRequestForPOM[];

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
      ['FY21', 600000, 200001, 200000, 300000]
    ],
    options: {
      title: 'Community TOA',
      width: 200,
      height: 200,
      isStacked: true,
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
    console.info("RequestsSummaryToaWidgetComponent", width, height);
    console.info("Chart", this.columnChart.options.width, this.columnChart.options.height);

    this.columnChart.options.width = width;
    this.columnChart.options.height = height - 40;

    setTimeout(()=>{
      this.chartReady = true;
    }, 200);

  }

  ngOnInit() {
    let chartOptions: string[] = ['All', 'Organization', 'BA Line', 'Program Status'];
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
    if (chartType.id === "All") {
      //change to all
      this.chartAll();
    }
    else if (chartType.id === "Organization") {
      //change to org
      this.chartOrganization();
    }
    else if (chartType.id === "BA Line") {
      //change to ba line
      this.chartBALine();
    }
    else if (chartType.id === "Program Status") {
      //change to program status
      this.chartProgramStatus();
    }
  }

  private chartAll() {
    // update data
    let allTable = [
      ['Fiscal Year', 'PRs Submitted', 'PRs Planned', 'TOA Difference', 'Unallocated'],
      ['FY16', 350001, 200001, 100000, 10000],
      ['FY17', 400001, 300001, 150000, 200000],
      ['FY18', 250001, 400001, 40000, 300000],
      ['FY19', 650001, 6000, 300000, 100000],
      ['FY20', 500001, 70000, 100000, 50000],
      ['FY21', 600000, 200001, 200000, 300000]
    ]
    // update title
    this.columnChart.options.title = 'Community TOA';

    this.columnChart.dataTable = allTable;
    this.columnChart.component.draw();
  }

  private chartOrganization() {
    // update data
    let OrganizationTable = [
      ['Fiscal Year', 'PRs Submitted', 'PRs Planned', 'TOA Difference', 'Unallocated'],
      ['FY16', 50000, 7000, 10000, 5000],
      ['FY17', 60000, 20000, 20000, 30000],
      ['FY18', 25000, 40000, 4000, 30000],
      ['FY19', 65000, 600, 30000, 10000],
      ['FY20', 35000, 20000, 10000, 1000],
      ['FY21', 40000, 30000, 15000, 20000]
    ]
    // update title
    this.columnChart.options.title = 'Organization DUSA-TE';

    this.columnChart.dataTable = OrganizationTable;
    this.columnChart.component.draw();
  }

  private chartBALine() {
    // update data
    let lineTable = [
      ['Fiscal Year', 'PRs Submitted', 'PRs Planned', 'TOA Difference', 'Unallocated'],
      ['FY16', 7501, 2001, 100, 100],
      ['FY17', 5001, 3001, 1500, 1000],
      ['FY18', 1501, 4001, 400, 300],
      ['FY19', 901, 1000, 1000, 10],
      ['FY20', 801, 700, 100, 50],
      ['FY21', 300, 2001, 2000, 300]
    ]
    // update title
    this.columnChart.options.title = 'BA SA0001';

    this.columnChart.dataTable = lineTable;
    this.columnChart.component.draw();
  }

  private chartProgramStatus() {
    // update data
    let programTable = [
      ['Fiscal Year', 'PRs Submitted', 'PRs Planned', 'TOA Difference', 'Unallocated'],
      ['FY16', 350001, 200001, 100000, 10000],
      ['FY17', 400001, 300001, 150000, 200000],
      ['FY18', 250001, 400001, 40000, 300000],
      ['FY19', 650001, 6000, 300000, 100000],
      ['FY20', 500001, 70000, 100000, 50000],
      ['FY21', 600000, 200001, 200000, 300000]
    ]
    // update title
    this.columnChart.options.title = 'PRstat OUTSTANDING';

    this.columnChart.dataTable = programTable;
    this.columnChart.component.draw();
  }
}
