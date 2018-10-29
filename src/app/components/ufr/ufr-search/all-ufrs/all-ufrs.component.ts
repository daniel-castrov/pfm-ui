import { UserUtils } from '../../../../services/user.utils';
import { Component, OnInit, ViewChild, Input } from '@angular/core';
import { Router } from '@angular/router';
import { AgGridNg2 } from "ag-grid-angular";
import {
  ProgramsService, OrganizationService, Organization, User, Program, UFRsService, UFR, UFRFilter,
  UfrStatus
} from '../../../../generated';
import { ProgramRequestWithFullName, ProgramWithFullName, WithFullNameService } from "../../../../services/with-full-name.service";
import { SimpleLinkCellRendererComponent, SimpleLink } from '../../../renderers/simple-link-cell-renderer/simple-link-cell-renderer.component';
import {CycleUtils} from "../../../../services/cycle.utils";
import {FundingLinesUtils} from "../../../../utils/FundingLinesUtils";
import {FormatterUtil} from "../../../../utils/formatterUtil";

@Component({
  selector: 'all-ufrs',
  templateUrl: './all-ufrs.component.html',
  styleUrls: ['./all-ufrs.component.scss']
})
export class AllUfrsComponent implements OnInit {

  @Input() private mapCycleIdToFy: Map<string, string>;

  // Map <id of Program or PR, ProgramWithFullName or ProgramRequestWithFullName>
  private mapPrIdToObj: Map<string, any>;

  private user: User;
  private orgMap: any[] = []
  private filtertext;
  private fy: number;

  // agGrid
  @ViewChild("agGrid") private agGrid: AgGridNg2;
  private rowData: any[];
  private colDefs;
  private menuTabs = ['filterMenuTab'];

  @Input() urlPath;

  private frameworkComponents:any = {
    simpleLinkCellRendererComponent: SimpleLinkCellRendererComponent
  };

  constructor( private ufrsService: UFRsService,
               private userUtils: UserUtils,
               private programsService: ProgramsService,
               private orgSvc: OrganizationService,
               private router: Router,
               private withFullNameService: WithFullNameService,
               private cycleUtils: CycleUtils) {}

  async ngOnInit() {

    this.user = await this.userUtils.user().toPromise();
    await this.initProgrammyIdToFullName();

    let organizations: Organization[] = (await this.orgSvc.getByCommunityId(this.user.currentCommunityId).toPromise()).result;
    organizations.forEach(org => {
      this.orgMap[org.id] = org.abbreviation;
    });

    this.fy = (await this.cycleUtils.currentPom().toPromise()).fy;

    this.setAgGridColDefs();
    this.populateRowData();
    setTimeout(() => {
      this.agGrid.api.sizeColumnsToFit()
    });
  }

  private setAgGridColDefs(): any {

    let colKeys: string[] = ["UFR #", "UFR Name", "Prog Id", "Status", "Priority", "Disposition",
      "Last Updated", "Funding Request", "Func Area", "Organization"];

    this.colDefs = [];

    colKeys.forEach(colKey => {
      let coldef;

      switch (colKey) {
        case ("UFR #"):
          coldef = {
            headerName: colKey,
            field: colKey,
            headerTooltip: 'UFR #',
            width: 50,
            editable: false,
            cellRenderer: 'simpleLinkCellRendererComponent',
            menuTabs: this.menuTabs,
            filter: 'agTextColumnFilter',
            getQuickFilterText: params =>  {
              return params.value.linktext;
            },
            comparator: this.ufrCompare
          }
          break;
        case ("UFR Name"):
            coldef = {
              headerName: colKey,
              field: colKey,
              headerTooltip: 'UFR Name',
              width: 140,
              editable: false,
              menuTabs: this.menuTabs,
              filter: 'agTextColumnFilter',
            };
          break;
        case ("Prog ID"):
            coldef = {
              headerName: colKey,
              field: colKey,
              headerTooltip: 'Prog ID',
              width: 60,
              editable: false,
              menuTabs: this.menuTabs,
              filter: 'agTextColumnFilter',
            };
          break;
        case ("Priority"):
            coldef = {
              headerName: colKey,
              field: colKey,
              headerTooltip: 'Priority',
              width: 60,
              editable: false,
              menuTabs: this.menuTabs,
              filter: 'agTextColumnFilter',
            };
          break;
        case ("Disposition"):
            coldef = {
              headerName: colKey,
              field: colKey,
              headerTooltip: 'Disposition',
              width: 200,
              editable: false,
              menuTabs: this.menuTabs,
              filter: 'agTextColumnFilter',
            };
          break;
        case ("Funding Request"):
            coldef = {
              headerName: colKey,
              field: colKey,
              headerTooltip: 'Funding Request',
              width: 80,
              editable: false,
              menuTabs: this.menuTabs,
              filter: 'agTextColumnFilter',
            };
          break;
        case ("Last Updated"):
          coldef = {
            headerName: colKey,
            field: colKey,
            headerTooltip: 'Last Updated',
            width: 102,
            editable: false,
            cellRenderer: params => FormatterUtil.dateFormatter(params.value),
            menuTabs: this.menuTabs,
            filter: 'agDateColumnFilter',
          };
          break;
        case ("Func Area"):
          coldef = {
            headerName: colKey,
            field: colKey,
            headerTooltip: 'Func Area',
            width: 60,
            hide: true,
            editable: false,
            menuTabs: this.menuTabs,
            filter: 'agTextColumnFilter',
          };
          break;
        case ("Organization"):
          coldef = {
            headerName: colKey,
            field: colKey,
            headerTooltip: 'Organization',
            width: 102,
            hide: true,
            editable: false,
            menuTabs: this.menuTabs,
            filter: 'agTextColumnFilter',
          };
          break;
        default:
          coldef = {
            headerName: colKey,
            field: colKey,
            width: 60,
            editable: false,
            menuTabs: this.menuTabs,
            filter: 'agTextColumnFilter',
          };
          break;
      }
      this.colDefs.push(coldef);
    });
  }

  private onGridReady(params) {
    params.api.sizeColumnsToFit();
    window.addEventListener("resize", function () {
      setTimeout(() => {
        params.api.sizeColumnsToFit();
      });
    });
  }

  private ufrCompare(param1, param2){
    return param1.linktext.localeCompare( param2.linktext );
  }

  private async populateRowData() {

    const ufrFilter: UFRFilter = {};

    let ufrs: UFR[] = (await this.ufrsService.search(this.user.currentCommunityId, ufrFilter).toPromise()).result;

    if (this.urlPath === 'ufr-approval-detail') {
      ufrs = ufrs.filter(ufr => ufr.status !== UfrStatus.SAVED)
    }

    let alldata: any[] = [];
    let progId:string, funcArea:string , orgid:string;
    ufrs.forEach(ufr => {

      if ( ufr.shortyId ){
        let progOrPr = this.mapPrIdToObj.get(ufr.shortyId);
        if ( progOrPr ){
          progId = progOrPr.fullname;
          funcArea = progOrPr.functionalArea;
          orgid = progOrPr.organization;
        } else {
          progId = "";
          funcArea = "";
          orgid = "-1";
        }
      } else {
        progId = "(new)"
        funcArea = ufr.functionalArea;
        orgid = ufr.organization;
      }

      let row = {
        "UFR #": new SimpleLink( "/" + this.urlPath + "/"+ufr.id, this.ufrNumber(ufr) ),
        "UFR Name": ufr.ufrName,
        "Prog Id": progId,
        "Status": ufr.status,
        "Priority": ufr.priority,
        "Disposition": ufr.disposition,
        "Last Updated": ufr.lastMod,
        "Funding Request": '$' + this.sum(ufr),
        "Func Area": funcArea,
        "Organization": this.orgMap[orgid]
      }
      alldata.push(row);
    });
    this.rowData = alldata;
  }

  sum(ufr: UFR): number {
    return FundingLinesUtils.totalForAndAfterYear(ufr.fundingLines, this.fy );
  }

  private async initProgrammyIdToFullName(): Promise<any> {
    return new Promise( async (resolve) => {
      // TODO: make the following two calls in parallel
      this.mapPrIdToObj = new Map<string, any>();
      (await this.withFullNameService.programs()).forEach((program: ProgramWithFullName) => {
        this.mapPrIdToObj.set(program.id, program);
      });
      (await this.withFullNameService.allProgramRequestsWithFullNamesDerivedFromCreationTimeData())
        .forEach((pr: ProgramRequestWithFullName) => {
        this.mapPrIdToObj.set(pr.id, pr);
      });
      resolve();
    });
  }

  private ufrNumber(ufr: UFR): string {
    // the value stored in this.mapCycleIdToFy looks like this: 'POM 2017'
    const fullFy = +this.mapCycleIdToFy.get(ufr.phaseId).slice(-4);
    const shortFy = fullFy - 2000;
    const sequentialNumber = ('000' + ufr.requestNumber).slice(-3);
    return shortFy + sequentialNumber;
  }

  private onFilterTextBoxChanged() {
    this.agGrid.gridOptions.api.setQuickFilter( this.filtertext );
  }

  onToolPanelVisibleChanged(params) {
    this.agGrid.api.sizeColumnsToFit();
  }

  onColumnVisible(params) {
    this.agGrid.api.sizeColumnsToFit();
  }

}
