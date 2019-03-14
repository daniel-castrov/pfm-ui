import {Component, ViewChild} from '@angular/core';
import {AgGridNg2} from 'ag-grid-angular';

@Component({
  selector: 'bes-proc',
  templateUrl: './bes-proc.component.html',
  styleUrls: ['./bes-proc.component.scss']
})
export class BesProcComponent  {

  @ViewChild("agGrid") private agGrid: AgGridNg2;

  private gridApi;
  private gridColumnApi;
  private columnDefs;
  private rowData;
  private groupDefaultExpanded;
  private getTreeHierarchy;
  private autoGroupColumnDef;

  items: any[] = [];

  constructor() {

    this.columnDefs = [
      {
        field: "form",
        headerName: "Form",
        maxWidth: 120,
      },
      {
        field: "status",
        headerName: "Status",
        maxWidth: 120,
      },
      {
        field: "PE",
        maxWidth: 120,
      },
      {
        field: "desc",
      },
    ];

    this.initRowData();

    this.groupDefaultExpanded = -1;

    this.getTreeHierarchy = this.treeHierarchy;

    this.autoGroupColumnDef = {
      headerName: "",
      maxWidth: 400,
      cellRendererParams: { suppressCount: true }
    };
  }

  treeHierarchy(data) {
    return data.hierarchy;
  }

  onFilterTextBoxChanged() {
    this.gridApi.setQuickFilter(document.getElementById("filter-text-box").nodeValue);
  }

  onGridReady(params) {
    this.gridApi = params.api;
    this.gridColumnApi = params.columnApi;

    params.api.sizeColumnsToFit();
  }

  initRowData() {

    this.getDemoData();

    let data: any[] = [];

    this.getOverviewAndR1( ["PROC"] ).forEach( x => data.push(x) );

    this.rowData = data;
  }

  getOverviewAndR1(hier) :any {

    let data:any[] = [];
    data.push({
      hierarchy: hier.concat( "Overview" ),
      status: "complete",
      PE: "",
      form: "Overview",
      desc: "A file with an overall desription"
    });

    data.push({
      hierarchy: hier.concat( "P-1" ),
      status: "complete",
      PE: "",
      form: "P-1",
      desc: "A file that is the P-1 form"
    });
    return data;
  }



  getDemoData() {

    this.items = [];
  }
}
