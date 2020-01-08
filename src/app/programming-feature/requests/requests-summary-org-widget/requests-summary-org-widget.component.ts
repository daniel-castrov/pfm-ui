import { Component, Input, OnInit } from '@angular/core';
import { GoogleChartInterface } from 'ng2-google-charts/google-charts-interfaces';
import { ProgramRequestForPOM } from '../../models/ProgramRequestForPOM';
import { ListItem } from '../../../pfm-common-models/ListItem';

@Component({
  selector: 'pfm-requests-summary-org-widget',
  templateUrl: './requests-summary-org-widget.component.html',
  styleUrls: ['./requests-summary-org-widget.component.scss']
})
export class RequestsSummaryOrgWidgetComponent  {

  @Input() griddata:ProgramRequestForPOM[];

  chartReady:boolean;
  availableCharts: ListItem[];

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
    let chartOptions: string[] = ['Organization', 'BA Line', 'Program Status'];
    this.availableCharts = this.toListItem(chartOptions);
  }

  private chartSelected(chartType:any){
    //todo
    console.log(chartType);

    if (chartType.id === "Organization") {
      //change to org
      this.chartOrganization()
    }
    else if (chartType.id === "BA Line") {
      //change to ba line
      this.chartBALine()
    }
    else if (chartType.id === "Program Status") {
      //change to program status
      this.chartProgramStatus()
    }
  }

  private chartOrganization(){
    //set up Organization tree structure
    let organizationTable = [
      ['Program', 'Organization', 'Health', 'Demands'],
      ['Organization', null, 0, 0],
      ['JSTO-CBD', 'Organization', 0, 0],
      ['JPEO-CBRND', 'Organization', 0, 0],
      ['JRO-CBD', 'Organization', 0, 0],
      ['PAIDO-CBD', 'Organization', 0, 0],
      ['DUS', 'Organization', 0, 0],
      ['SPU', 'JSTO-CBD', 100, 50],
      ['LDN', 'JSTO-CBD', 10, 0],
      ['RUI', 'JPEO-CBRND', 99, 48],
      ['PIP', 'JRO-CBD', 10, 10],
      ['QPM', 'PAIDO-CBD', 70, 0],
      ['WES', 'DUS', 10, 60]
    ];

    //load data into chart

    //set data to chart
    console.log(organizationTable);
    this.treeMapChart.dataTable = organizationTable;
    this.treeMapChart.component.draw()
  }

  private chartBALine(){
    //set up BA Line tree structure
    let lineTable = [
      ['Program', 'Organization', 'Health', 'Demands'],
      ['BA Line', null,  0,  0],
      ['SA0001', 'BA Line',  0,  0],
      ['BA2', 'BA Line',  0,  0],
      ['BA5', 'BA Line',  0, 0],
      ['PHM001', 'BA Line',  0,  0],
      ['BA4', 'BA Line', 0, 0],
      ['BA1', 'BA Line', 0, 0],
      ['BA3', 'BA Line', 0, 0],
      ['BA6', 'BA Line', 0, 0],

    ];

    //load data into chart

    //set data to chart
    console.log(lineTable);
    this.treeMapChart.dataTable = lineTable;
    this.treeMapChart.component.draw()
  }

  private chartProgramStatus(){
    //set up Status tree structure
    let statusTable = [
      ['Program', 'Organization', 'Health', 'Demands'],
      ['Program Status', null,  0,  0],
      ['OUTSTANDING', 'Program Status',  0,  0],
      ['Pfm', 'OUTSTANDING', 100, 100]
    ];

    //load data into chart

    //set data to chart
    console.log(statusTable);
    this.treeMapChart.dataTable = statusTable;
    this.treeMapChart.component.draw()
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
