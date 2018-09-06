import { ProgramTreeUtils } from './../../../../utils/program-tree-utils';
import { UserUtils } from '../../../../services/user.utils';
import { FilterUfrsComponent } from './../filter-ufrs/filter-ufrs.component';
import { Component, OnInit, ViewChild, Input } from '@angular/core';
import { Router } from '@angular/router';
import { AgGridNg2 } from "ag-grid-angular";
import { MatTableDataSource, MatPaginator, MatSort } from '@angular/material';
import { ProgramsService, OrganizationService, Organization, User, Program, UFRsService, UFR, UFRFilter } from '../../../../generated';
import { DatePipe } from "@angular/common";

@Component({
  selector: 'all-ufrs',
  templateUrl: './all-ufrs.component.html',
  styleUrls: ['./all-ufrs.component.scss']
})
export class AllUfrsComponent implements OnInit {
  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sorter: MatSort;

  @Input() private filterUfrsComponent: FilterUfrsComponent;
  @Input() private mapCycleIdToFy: Map<string, string>;

  private mapProgramIdToName: Map<string, string> = new Map<string, string>();// mrid, fullname
  private user: User;
  private orgMap: any[] = []
  datePipe: DatePipe = new DatePipe('en-US')

  // agGrid   
  @ViewChild("agGrid") private agGrid: AgGridNg2;
  private rowData: any[];
  private colDefs;
  private menuTabs = ['filterMenuTab'];

  constructor(private ufrsService: UFRsService,
    private userUtils: UserUtils,
    private programsService: ProgramsService,
    private orgSvc: OrganizationService,
    private router: Router) { }

  async ngOnInit() {

    this.user = await this.userUtils.user().toPromise();
    const programs: Program[] = (await this.programsService.getAll().toPromise()).result;
    this.initProgramIdToName(programs);

    let organizations: Organization[] = (await this.orgSvc.getByCommunityId(this.user.currentCommunityId).toPromise()).result;
    organizations.forEach(org => {
      this.orgMap[org.id] = org.abbreviation;
    });

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
            width: 102,
            editable: false,
            cellRenderer: params => this.linkCellRenderer(params),
            menuTabs: this.menuTabs,
            filter: 'agTextColumnFilter',
          }
          break;
        case ("Last Updated"):
          coldef = {
            headerName: colKey,
            field: colKey,
            width: 102,
            editable: false,
            cellRenderer: params => this.dateFormatter(params.value),
            menuTabs: this.menuTabs,
            filter: 'agDateColumnFilter',
          }
          break;
        case ("Func Area"):
        case ("Organization"):
          coldef = {
            headerName: colKey,
            field: colKey,
            width: 102,
            hide: true,
            editable: false,
            menuTabs: this.menuTabs,
            filter: 'agTextColumnFilter',
          }
          break;  
        default:
          coldef = {
            headerName: colKey,
            field: colKey,
            width: 102,
            editable: false,
            menuTabs: this.menuTabs,
            filter: 'agTextColumnFilter',
          }
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

  async populateRowData() {

    const ufrFilter: UFRFilter = {};
    let ufrs: UFR[] = (await this.ufrsService.search(this.user.currentCommunityId, ufrFilter).toPromise()).result;

    let alldata: any[] = [];
    ufrs.forEach(ufr => {

      let row = {
        "UFR #": ufr,
        "UFR Name": ufr.description,
        "Prog Id": this.mapProgramIdToName.get(ufr.shortyId),
        "Status": ufr.status,
        "Priority": ufr.priority,
        "Disposition": ufr.disposition,
        "Last Updated": ufr.lastMod,
        "Funding Request": "",
        "Func Area": ufr.functionalArea,
        "Organization": this.orgMap[ufr.organization]
      }
      alldata.push(row);
    });
    this.rowData = alldata;
  }

  // TODO - I don't think this is the right way 
  linkCellRenderer(params) {
    let link = `<a href="/ufr-view/${params.value.id}">${this.ufrNumber(params.value)}</a>`
    return link;
  }

  dateFormatter(longdate) {
    let dateFormat = 'MM/dd/yyyy hh:mm:ss a';
    return this.datePipe.transform(new Date(longdate), dateFormat);
  }

  private initProgramIdToName(programs: Program[]) {
    ProgramTreeUtils.fullnames(programs).forEach((fullname, program) => {
      this.mapProgramIdToName.set(program.id, fullname);
    });
  }

  ufrNumber(ufr: UFR): string {
    const fullFy = +this.mapCycleIdToFy.get(ufr.phaseId).slice(-4); // the value stored in this.mapCycleIdToFy look like this: 'POM 2017'
    const shortFy = fullFy - 2000;
    const sequentialNumber = ('000' + ufr.requestNumber).slice(-3);
    return shortFy + sequentialNumber;
  }

  onFilterTextBoxChanged() {    
    let filterText = document.getElementById('filtertestbox').innerText;
    console.log( filterText );
    this.agGrid.gridOptions.api.setQuickFilter( filterText );
}

}
