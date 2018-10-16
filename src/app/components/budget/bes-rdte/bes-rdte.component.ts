import { Component, OnInit, ViewChild } from '@angular/core';
import { AgGridNg2 } from 'ag-grid-angular';
import { HeaderComponent } from '../../header/header.component';

@Component({ 
  selector: 'app-bes-rdte',
  templateUrl: './bes-rdte.component.html',
  styleUrls: ['./bes-rdte.component.scss']
})
export class BesRdteComponent {

  @ViewChild(HeaderComponent) header;
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

    this.getOverviewAndR1( ["RDTE"] ).forEach( x => data.push(x) );

    for ( let i=1; i<8; i++ ){

      let ba:string = "BA-"+i;

      this.getR2Fields(["RDTE", ba, "R-2"]).forEach( x => data.push(x) );

      this.items.filter( itm =>  itm.ba==i.toString()  ).forEach( item => {

        this.getR2AFields( ["RDTE", ba, item.inum, "R-2A"] , item ).forEach( x => data.push(x) );

        if  ( item.fyt > 10 && (item.ba == "4" || item.ba == "5" || item.ba == "7") ){
          this.getR3Fields(  ["RDTE", ba, item.inum,"R-3"] ,  item).forEach( x => data.push(x) );
          this.getR4Fields(  ["RDTE", ba, item.inum,"R-4"] ,  item).forEach( x => data.push(x) );
          this.getR4AFields( ["RDTE", ba, item.inum,"R-4A"] , item).forEach( x => data.push(x) );
        }
      });
    }
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
      hierarchy: hier.concat( "R-1" ),
      status: "complete",
      PE: "",
      form: "R-1",
      desc: "A file that is the R-1 form"
    });
    return data;
  }

  getR2Fields( hier ) :any {

    let data: any[] = [];
    data.push({
      hierarchy: hier.concat( "Overview" ),
      status: "new",
      PE: "",
      form: "R-2",
      desc: "Overall Mission Description and Budget Item Justification"
    });

    data.push({
      hierarchy: hier.concat( "Change Summary" ),
      status: "new",
      PE: "",
      form: "R-2",
      desc: "Overall Program Change Summary ($ in Millions)"
    });
    return data;
  }

  getR2AFields(hier, item) :any {

    let data: any[] = [];
    data.push({
      hierarchy: hier.concat("Mission Description"),
      status: "new",
      PE: item.pe,
      form: "R-2A",
      desc: "Item Mission Description and Budget Item Justification"
    });

    data.push({
      hierarchy: hier.concat("Accomplishments"),
      status: "new",
      PE: item.pe,
      form: "R-2A",
      desc: "Item Accomplishments"
    });

    data.push({
      hierarchy: hier.concat("Bullets"),
      status: "new",
      PE: item.pe,
      form: "R-2A",
      desc: "Item Bullets"
    });

    if ( item.ba != "6" )
    data.push({
      hierarchy: hier.concat("Other Funding"),
      status: "new",
      PE: item.pe,
      form: "R-2A",
      desc: "Other Program Funding for this Item"
    });

    data.push({
      hierarchy: hier.concat("Remarks"),
      status: "new",
      PE: item.pe,
      form: "R-2A",
      desc: "Item Remarks"
    });

    if ( item.ba == "4" || item.ba == "5" || item.ba == "7"   ){
      data.push({
        hierarchy: hier.concat("Acquisition Strategy"),
        status: "new",
        PE: item.pe,
        form: "R-2A",
        desc: "Item Acquisition Strategy"
      });
    }

    if ( item.ba == "7"){
      data.push({
        hierarchy: hier.concat("Performance Metrics"),
        status: "new",
        PE: item.pe,
        form: "R-2A",
        desc: "Item Performance Metrics"
      });
    }
    return data;
  }

  getR3Fields(hier, item) :any {

    let data:any[] = [];
    data.push({
      hierarchy: hier.concat("Product Development"),
      status: "new",
      PE: item.pe,
      form: "R-3",
      desc: "Item Product Development ($ in Millions)"
    });
    data.push({
      hierarchy: hier.concat("Support"),
      status: "new",
      PE: item.pe,
      form: "R-3",
      desc: "Item Support ($ in Millions)"
    });
    data.push({
      hierarchy: hier.concat("Test and Evaluation"),
      status: "new",
      PE: item.pe,
      form: "R-3",
      desc: "Item Test and Evaluation ($ in Millions)"
    });
    data.push({
      hierarchy: hier.concat("Management Services"),
      status: "new",
      PE: item.pe,
      form: "R-3",
      desc: "Item Management Services ($ in Millions)"
    });
    data.push({
      hierarchy: hier.concat("Remarks"),
      status: "new",
      PE: item.pe,
      form: "R-3",
      desc: "Item Remarks"
    });
    return data;
  }

  getR4Fields(hier, item) :any {
    let data:any[] = [
      {
        hierarchy: hier.concat("Gantt Chart"),
        status: "new",
        PE: item.pe,
        form: "R-4",
        desc: "A generated Gantt Chart"
      }
    ];
    return data;
  }

  getR4AFields(hier, item) :any {
    let data:any[] = [
      {
        hierarchy: hier.concat("Schedule Details"),
        status: "new",
        PE: item.pe,
        form: "R-4A",
        desc: "Item Schedule Details to generate a Gantt Chart"
      }
    ];
    return data;
  }

  getDemoData() {

    this.items = [
      { inum: "LF1", ba: "1", pe: "0601384BP", fyt: 30 },
      { inum: "PS1", ba: "1", pe: "0601384BP", fyt: 16 },

      { inum: "CB2", ba: "2", pe: "0602384BP", fyt: 68 },
      { inum: "NT2", ba: "2", pe: "0602384BP", fyt: 54 },
      { inum: "TM2", ba: "2", pe: "0602384BP", fyt: 71 },

      { inum: "CB3", ba: "3", pe: "0603384BP", fyt: 21 },
      { inum: "NT3", ba: "3", pe: "0603384BP", fyt: 22 },
      { inum: "TM4", ba: "3", pe: "0603384BP", fyt: 88 },
      { inum: "TT3", ba: "3", pe: "0603384BP", fyt: 10 },

      { inum: "CA4", ba: "4", pe: "0603884BP", fyt: 35 },
      { inum: "DE4", ba: "4", pe: "0603884BP", fyt: 7 },
      { inum: "IP4", ba: "4", pe: "0603884BP", fyt: 4 },
      { inum: "IS4", ba: "4", pe: "0603884BP", fyt: .8 },
      { inum: "MB4", ba: "4", pe: "0603884BP", fyt: 73 },
      { inum: "MC4", ba: "4", pe: "0603884BP", fyt: 2 },
      { inum: "TE4", ba: "4", pe: "0603884BP", fyt: 6 },

      { inum: "CA5", ba: "5", pe: "0604384BP", fyt: 150 },
      { inum: "CM5", ba: "5", pe: "0604384BP", fyt: 6 },
      { inum: "CO5", ba: "5", pe: "0604384BP", fyt: 10 },
      { inum: "DE5", ba: "5", pe: "0604384BP", fyt: 14 },
      { inum: "IP5", ba: "5", pe: "0604384BP", fyt: 9 },
      { inum: "IS5", ba: "5", pe: "0604384BP", fyt: 23 },
      { inum: "MB5", ba: "5", pe: "0604384BP", fyt: 107 },
      { inum: "MC5", ba: "5", pe: "0604384BP", fyt: 62 },
      { inum: "TE5", ba: "5", pe: "0604384BP", fyt: 9 },

      { inum: "DT6", ba: "6", pe: "0605384BP", fyt: 3 },
      { inum: "DW6", ba: "6", pe: "0605384BP", fyt: 55 },
      { inum: "LS6", ba: "6", pe: "0605384BP", fyt: 13 },
      { inum: "MS6", ba: "6", pe: "0605384BP", fyt: 34 },
      { inum: "O49", ba: "6", pe: "0605384BP", fyt: 1 },
      { inum: "SB6", ba: "6", pe: "0605502BP", fyt: 0 },

      { inum: "CA7", ba: "7", pe: "0607384BP", fyt: 6 },
      { inum: "CM7", ba: "7", pe: "0607384BP", fyt: 4 },
      { inum: "CO7", ba: "7", pe: "0607384BP", fyt: 3 },
      { inum: "DE7", ba: "7", pe: "0607384BP", fyt: .4 },
      { inum: "IP7", ba: "7", pe: "0607384BP", fyt: 2 },
      { inum: "IS7", ba: "7", pe: "0607384BP", fyt: 16 },
      { inum: "MB7", ba: "7", pe: "0607384BP", fyt: 3 },
      { inum: "TE7", ba: "7", pe: "0607384BP", fyt: 5 }
    ];
  }
}
