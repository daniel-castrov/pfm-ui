import { Component, Input, OnInit } from '@angular/core';
import { ProgramSummary } from '../../../models/ProgramSummary';
import { ListItem } from '../../../../pfm-common-models/ListItem';
import { Organization } from 'src/app/pfm-common-models/Organization';
import { Role } from 'src/app/pfm-common-models/Role';
import { RequestSummaryNavigationHistoryService } from '../requests-summary-navigation-history.service';
import { IntIntMap } from '../../../models/IntIntMap';
import { FormatterUtil } from '../../../../util/formatterUtil';

@Component({
  selector: 'pfm-requests-summary-org-widget',
  templateUrl: './requests-summary-org-widget.component.html',
  styleUrls: ['./requests-summary-org-widget.component.scss']
})
export class RequestsSummaryOrgWidgetComponent implements OnInit {
  @Input() griddata: ProgramSummary[];
  @Input() orgs: Organization[];
  @Input() roles: Role[];
  @Input() baBlinSummary: IntIntMap;

  chartReady: boolean;
  availableCharts: ListItem[];
  defaultChart: ListItem;

  treeMapChart: any = {
    chartType: 'TreeMap',
    dataTable: [
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
    ],
    options: {
      highlightOnMouseOver: true,
      minColor: '#FDC217',
      midColor: '#29BD75',
      maxColor: '#21809C',
      fontColor: 'black',

      // showScale: true,
      showTooltips: true,
      width: 200,
      height: 200,
      animation: {
        duration: 1000,
        easing: 'out',
        startup: true
      }
    }
  };

  constructor(private requestSummaryNavigationHistoryService: RequestSummaryNavigationHistoryService) {}

  onResize(width: number, height: number): void {
    this.chartReady = false;

    this.treeMapChart.options.width = width;
    this.treeMapChart.options.height = height - 40;

    setTimeout(() => {
      this.chartReady = true;
      this.loadPreviousSelection();
      this.chartSelected(this.defaultChart);
    }, 200);
  }

  ngOnInit() {
    const chartOptions: string[] = ['Organization', 'BA/BLIN', 'Program Status'];
    this.availableCharts = this.toListItem(chartOptions);
    this.defaultChart = this.availableCharts[0];
  }

  noClick(event) {
    this.treeMapChart = Object.assign({}, this.treeMapChart);
  }

  loadPreviousSelection() {
    const previousOrganizationWidget = this.requestSummaryNavigationHistoryService.getSelectedOrganizationWidget();
    if (previousOrganizationWidget) {
      const currentOrganizationWidget = this.availableCharts.find(chart => chart.id === previousOrganizationWidget);
      if (currentOrganizationWidget) {
        this.defaultChart = currentOrganizationWidget;
      }
    }
    this.requestSummaryNavigationHistoryService.updateRequestSummaryNavigationHistory({
      selectedOrganizationWidget: this.defaultChart.id
    });
  }

  chartSelected(chartType: any) {
    if (chartType.id === 'Organization') {
      // change to org
      this.defaultChart = this.availableCharts[0];
      this.chartOrganization();
    } else if (chartType.id === 'BA/BLIN') {
      // change to BA/BLIN
      this.defaultChart = this.availableCharts[1];
      this.chartBABlin();
    } else if (chartType.id === 'Program Status') {
      // change to program status
      this.defaultChart = this.availableCharts[2];
      this.chartProgramStatus();
    }
    this.requestSummaryNavigationHistoryService.updateRequestSummaryNavigationHistory({
      selectedOrganizationWidget: this.defaultChart.id
    });
  }

  private chartOrganization() {
    // set up Organization tree structure
    // load data into chart
    let orgDataTable: any;

    orgDataTable = [];
    orgDataTable.push(['Program', 'Organization', 'Health', 'Demands']);
    orgDataTable.push(['Organization', null, 0, 0]);
    this.orgs.forEach(org => {
      if (this.hasOrgData(org.id)) {
        orgDataTable.push([org.abbreviation, 'Organization', 0, 0]);
      }
    });

    let toltaltfunding = 0;
    if (this.griddata) {
      this.griddata.forEach(ps => {
        toltaltfunding = toltaltfunding + ps.fundsTotal;
      });

      this.griddata.forEach(ps => {
        const orgName = this.getOrgName(ps.organiztionId);
        if (orgName) {
          orgDataTable.push([
            ps.programName,
            orgName,
            (ps.fundsTotal / toltaltfunding) * 100,
            this.getOrgColors(orgName)
          ]);
        }
      });
      // set data to chart
      this.treeMapChart.dataTable = orgDataTable; // organizationTable;
      delete this.treeMapChart.options.generateTooltip;
      this.treeMapChart = Object.assign({}, this.treeMapChart);
      // this.treeMapChart.component.draw();
    }
  }

  private chartBABlin() {
    // set up BA/BLIN tree structure
    const lineTable = [
      ['BaBlin', 'Parent', 'Total', 'Total (color)'],
      ['BA/BLIN', null, 0, 0]
    ];
    // load data into chart
    for (const baBlin of Object.keys(this.baBlinSummary)) {
      lineTable.push([baBlin, 'BA/BLIN', this.baBlinSummary[baBlin], this.baBlinSummary[baBlin]]);
    }

    // set data to chart
    this.treeMapChart.dataTable = lineTable;
    const options = Object.assign({}, this.treeMapChart.options);
    options.generateTooltip = (row, value, size) => {
      return (
        '<div style="background:#fd9; padding:10px; border-style:solid">' +
        `${FormatterUtil.formatCurrency(value)}</div>`
      );
    };
    this.treeMapChart.options = options;

    setTimeout(() => {
      // this.treeMapChart.component.draw();
      this.treeMapChart = Object.assign({}, this.treeMapChart);
    }, 0);
  }

  private chartProgramStatus() {
    // set up Status tree structure
    let statusTable: any;

    statusTable = [];
    statusTable.push(['Program', 'Program Status', 'Health', 'Demands']);
    statusTable.push(['Program Status', null, 0, 0]);

    // statusTable.push([ 'Outstanding','Program Status',0,0]);
    /*this.roles.forEach(role =>{
         let roleacrynm = this.getRoleAcrynm(role.name);
        statusTable.push([ roleacrynm,'Program Status',0,0]);
    });
    */
    const toltalNoOfPrograms: number = this.griddata.length;
    if (this.griddata.length > 0) {
      const assignedTo = this.griddata[0].assignedTo;
      const roleacrynm = this.getRoleAcrynm(assignedTo);

      // get the count for each of the status
      let approvedcount = 0;
      let savedcount = 0;
      let outstandingcount = 0;
      let rejectedcount = 0;

      this.griddata.forEach(ps => {
        if (ps.assignedTo === assignedTo) {
          switch (ps.status.toLowerCase()) {
            case 'approved':
              approvedcount = approvedcount + 1;
              break;
            case 'rejected':
              rejectedcount = rejectedcount + 1;
              break;
            case 'saved':
              savedcount = savedcount + 1;
              break;
            case 'outstanding':
              outstandingcount = outstandingcount + 1;
              break;
          }
        }
      });

      const outstanding = (outstandingcount * 100) / toltalNoOfPrograms;
      const saved = (savedcount * 100) / toltalNoOfPrograms;
      const rejected = (rejectedcount * 100) / toltalNoOfPrograms;
      const approved = (approvedcount * 100) / toltalNoOfPrograms;

      // assignedTo = assignedTo.replace('_',' ');
      statusTable.push([roleacrynm + ' : Outstanding', 'Program Status', outstanding, 100]);
      statusTable.push([roleacrynm + ' : Saved', 'Program Status', saved, 50]);
      statusTable.push([roleacrynm + ' : Approved', 'Program Status', approved, 70]);
      statusTable.push([roleacrynm + ' : Rejected', 'Program Status', rejected, 10]);
    }

    console.log(JSON.stringify(statusTable));
    // load data into chart

    // set data to chart
    this.treeMapChart.dataTable = statusTable;
    delete this.treeMapChart.options.generateTooltip;
    this.treeMapChart = Object.assign({}, this.treeMapChart);
    // this.treeMapChart.component.draw();
    // this.treeMapChart.goUpAndDraw();
  }

  private toListItem(years: string[]): ListItem[] {
    const items: ListItem[] = [];
    for (const year of years) {
      const item: ListItem = new ListItem();
      item.id = year;
      item.name = year;
      item.value = year;
      items.push(item);
    }
    return items;
  }

  getOrgName(orgId: string): string {
    let orgName = '';
    for (const org of this.orgs) {
      if (org.id === orgId) {
        orgName = org.abbreviation;
        break;
      }
    }
    return orgName;
  }

  hasOrgData(orgId: string): boolean {
    let hasData = false;
    if (this.griddata) {
      for (const ps of this.griddata) {
        if (ps.organiztionId === orgId) {
          hasData = true;
          break;
        }
      }
    }
    return hasData;
  }

  getOrgColors(orgName: string): string {
    let colorcode: string;
    const orgcolors = [];
    orgcolors['PAIO'] = '60';
    orgcolors['DUSA'] = '0';
    orgcolors['JSTO'] = '40';
    orgcolors['JPEO'] = '10';
    orgcolors['JRO'] = '90';

    orgName = orgName.split('-')[0];
    colorcode = orgcolors[orgName];
    return colorcode;
  }

  getRoleAcrynm(role: string): string {
    let acrynm = '';
    role = role.replace('_', ' ');
    const names: string[] = role.split(' ');
    if (names.length === 1) {
      acrynm = role;
    } else {
      names.forEach(nm => {
        if (nm.indexOf('POM') !== -1) {
          acrynm = acrynm + 'PM';
        } else {
          acrynm = acrynm + nm.substr(0, 1);
        }
      });
    }
    console.log(role + ' : ' + acrynm);
    return acrynm;
  }
}
