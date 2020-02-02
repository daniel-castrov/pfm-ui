import { Component, Input, OnInit } from '@angular/core';
import { GoogleChartInterface } from 'ng2-google-charts/google-charts-interfaces';
import { ProgramSummary } from '../../../models/ProgramSummary';
import { ListItem } from '../../../../pfm-common-models/ListItem';
import { Organization } from 'src/app/pfm-common-models/Organization';
import { OrganizationServiceImpl } from 'src/app/services/organization-service-impl.service';

@Component({
  selector: 'pfm-requests-summary-org-widget',
  templateUrl: './requests-summary-org-widget.component.html',
  styleUrls: ['./requests-summary-org-widget.component.scss']
})
export class RequestsSummaryOrgWidgetComponent  {

  @Input() griddata:ProgramSummary[];
  @Input() orgs:Organization[];

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
      highlightOnMouseOver: true,
      minColor: '#FDC217',
      midColor: '#29BD75',
      maxColor: '#21809C',
      fontColor: 'black',
      //showScale: true,
      showTooltips:true,
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
      this.chartOrganization();
    }, 200);
  }

  ngOnInit() {
    let chartOptions: string[] = ['Organization', 'BA Line', 'Program Status'];
    this.availableCharts = this.toListItem(chartOptions);
    this.defaultChart = this.availableCharts[0];
    
  }

  private chartSelected(chartType:any){
    if (chartType.id === "Organization") {
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

  private chartOrganization(){
    //set up Organization tree structure
  
    /*let organizationTable = [
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
    ];*/

    //load data into chart
    let orgDataTable:any;

    orgDataTable = [];
    orgDataTable.push(['Program', 'Organization', 'Health', 'Demands']);
    orgDataTable.push(['Organization', null,  0,  0]);    
    this.orgs.forEach(org =>{
      if (this.hasOrgData(org.id)){    
        orgDataTable.push([org.abbreviation,'Organization',0,0]);  
      }    
    });

    var toltaltfunding :number = 0;
    this.griddata.forEach(ps => {  
      toltaltfunding = toltaltfunding + ps.fundsTotal;
    });
    
    this.griddata.forEach(ps => {      
      let orgName = this.getOrgName(ps.organiztionId);
      orgDataTable.push([ps.programName,orgName,((ps.fundsTotal/toltaltfunding)*100),this.getOrgColors(orgName)]);
    });
    
    //set data to chart
    this.treeMapChart.dataTable = orgDataTable; //organizationTable;
    this.treeMapChart.component.draw();
  }

  private chartBALine(){
    //set up BA Line tree structure
    let lineTable = [
      ['Program', 'Organization', 'Health', 'Demands'],
      ['BA Line', null, 0, 0],
      ['SA0001', 'BA Line', 0, 0],
      ['BA2', 'BA Line', 0, 0],
      ['BA5', 'BA Line', 0, 0],
      ['PHM001', 'BA Line', 0, 0],
      ['BA4', 'BA Line', 0, 0],
      ['BA1', 'BA Line', 0, 0],
      ['BA3', 'BA Line', 0, 0],
      ['BA6', 'BA Line', 0, 0],
      ['Test1', 'SA0001', 10, 100],
      ['Test2', 'BA1', 20, 50],
      ['Test3', 'BA2', 30, 10],
      ['Test4', 'BA3', 40, 0],
      ['Test5', 'BA4', 50, 40],
      ['Test6', 'BA5', 5, 10],
      ['Test7', 'BA6', 5, 10],
      ['Test8', 'PHM001', 50, 10]
    ];

    //load data into chart

    //set data to chart
    this.treeMapChart.dataTable = lineTable;
    this.treeMapChart.component.draw();
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
    this.treeMapChart.dataTable = statusTable;
    this.treeMapChart.component.draw();
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

  getOrgName(orgId:string):string{
    var orgName = "";
    for(let org of this.orgs){
      if (org.id == orgId){
        orgName = org.abbreviation;
        break;
      }
    }
    return orgName;
  }
  
  hasOrgData(orgId:string):boolean{
    let hasData:boolean = false;
    for( let ps of this.griddata)
    {
        if (ps.organiztionId == orgId)
        {
          hasData = true;
          break;          
        }        
    }
    return hasData;
  }

  getOrgColors(orgName:string):string{
    let colorcode:string;
    let orgcolors = []
    orgcolors["PAIO"] ="60";
    orgcolors["DUSA"] ="0";
    orgcolors["JSTO"] ="40";
    orgcolors["JPEO"] ="10";
    orgcolors["JRO"] ="90";

    orgName = orgName.split('-')[0];
    colorcode = orgcolors[orgName];
    return colorcode;
  }
}
