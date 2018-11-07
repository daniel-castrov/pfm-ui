import {Component, ViewChild} from '@angular/core';
import {AgGridNg2} from 'ag-grid-angular';
import {HeaderComponent} from '../../header/header.component';

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
  private rowData = [];
  private groupDefaultExpanded = -1;
  private autoGroupColumnDef = {
    headerName: "",
    maxWidth: 400,
    cellRendererParams: { suppressCount: true }
  };

  items = [];

  constructor() {
    this.columnDefs = [{field: "form",headerName: "Form",maxWidth: 120},
                       {field: "responsible",headerName: "Responsible",maxWidth: 120},
                       {field: "desc",headerName: "Description"}];
    this.initRowData();
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
    this.items = this.getItems();
    this.getOverviewAndR1( ["RDTE"] ).forEach( x => this.rowData.push(x) );

    for ( let i=1; i<8; i++ ){
      const ba = "BA-" + i;
      let itempe="";

      const itemsWithCurrentBa = this.items.filter(item => item.ba == i);

      itemsWithCurrentBa.forEach(item => {

        if ( item.pe != itempe ){
          itempe = item.pe;
          this.getR2Fields(["RDTE", ba, "PE:" + item.pe, "R-2"], item).forEach( x => this.rowData.push(x) );
        }
        
        this.getR2AFields( ["RDTE", ba, "PE:"+item.pe, "ITEM: "+item.inum, "R-2A"], item ).forEach( x => this.rowData.push(x) );

        if ( item.fyt > 10 && (item.ba == "4" || item.ba == "5" || item.ba == "7") ){
          this.getR3Fields(  ["RDTE", ba, "PE:"+item.pe, "ITEM: "+item.inum,"R-3"],  item).forEach( x => this.rowData.push(x) );
          this.getR4Fields(  ["RDTE", ba, "PE:"+item.pe, "ITEM: "+item.inum,"R-4"],  item).forEach( x => this.rowData.push(x) );
          this.getR4AFields( ["RDTE", ba, "PE:"+item.pe, "ITEM: "+item.inum,"R-4A"], item).forEach( x => this.rowData.push(x) );
        }
      });
    }
  }

  getOverviewAndR1(hierarchy: string[]) {
    let data = [];
    data.push({ hierarchy: hierarchy.concat( "FY" ), responsible: "Budget Manager", form: "Title", desc: "THe Budget Year" });
    data.push({ hierarchy: hierarchy.concat( "Cycle" ), responsible: "Budget Manager", form: "Title", desc: "BES or PB" });
    data.push({ hierarchy: hierarchy.concat( "Title" ), responsible: "Budget Manager", form: "Title", desc: "A Title" });
    data.push({ hierarchy: hierarchy.concat( "Community" ), responsible: "Budget Manager", form: "Title", desc: "CBDP" });
    data.push({ hierarchy: hierarchy.concat( "Type" ), responsible: "Budget Manager", form: "Title", desc: "Type of JB" });
    data.push({ hierarchy: hierarchy.concat( "Appropriation" ), responsible: "Budget Manager", form: "Title", desc: "RDT&E or PROC" });
    data.push({ hierarchy: hierarchy.concat( "Overview" ), responsible: "Budget Manager", form: "Overview", desc: "A file with an overall desription" });
    data.push({ hierarchy: hierarchy.concat( "R-1" ), responsible: "Budget Manager", form: "R-1", desc: "A file that is the R-1 form" });
    return data;
  }

  getR2Fields( hierarchy: string[], item ) {
    let data = [];
    data.push({ hierarchy: hierarchy.concat( "Overview" ), responsible: "Budget Manager", form: "R-2", desc: "Overall Mission Description and Budget Item Justification" });
    data.push({ hierarchy: hierarchy.concat( "Change Summary" ), responsible: "Budget Manager", form: "R-2", desc: "Overall Program Change Summary ($ in Millions)" });
    return data;
  }

  getR2AFields(hierarchy: string[], item) {
    let data = [];
    data.push({ hierarchy: hierarchy.concat("Mission Description"), responsible: "Budget Manager", form: "R-2A", desc: "Item Mission Description and Budget Item Justification" });
    data.push({ hierarchy: hierarchy.concat("Accomplishments"), responsible: "Budget Manager", form: "R-2A", desc: "Accomplishments Overview" });
    data.push({ hierarchy: hierarchy.concat("Program Accomplishments"), responsible: "Program Managers", form: "R-2A", desc: "Accomplishments for each Program" });
    data.push({ hierarchy: hierarchy.concat("Program Bullets"), responsible: "Program Managers", form: "R-2A", desc: "Bullets from each Program" });

    if ( item.ba != "6" )
    data.push({ hierarchy: hierarchy.concat("Other Funding"), responsible: "Budget Manager", form: "R-2A", desc: "Other Program Funding for this Item" });
    data.push({ hierarchy: hierarchy.concat("Remarks"), responsible: "Budget Manager", form: "R-2A", desc: "Item Remarks" });

    if ( item.ba == "4" || item.ba == "5" || item.ba == "7"   ){
      data.push({ hierarchy: hierarchy.concat("Acquisition Strategy"), responsible: "Program Managers", form: "R-2A", desc: "Acquisition Strategy from each Program" });
    }

    if ( item.ba == "7"){
      data.push({ hierarchy: hierarchy.concat("Performance Metrics"), responsible: "Program Managers", form: "R-2A", desc: "Item Performance Metrics" });
    }
    return data;
  }

  getR3Fields(hierarchy: string[], item) {
    let data = [];
    data.push({ hierarchy: hierarchy.concat("Product Development"), responsible: "Program Managers", form: "R-3", desc: "Table of Contracts from each Program for Product Development ($ in Millions)" });
    data.push({ hierarchy: hierarchy.concat("Support"), responsible: "Program Managers", form: "R-3", desc: "Table of Contracts from each Program for Support ($ in Millions)" });
    data.push({ hierarchy: hierarchy.concat("Test and Evaluation"), responsible: "Program Managers", form: "R-3", desc: "Table of Contracts from each Program for Test and Evaluation ($ in Millions)" });
    data.push({ hierarchy: hierarchy.concat("Management Services"), responsible: "Program Managers", form: "R-3", desc: "Table of Contracts from each Program for Management Services ($ in Millions)" });
    data.push({ hierarchy: hierarchy.concat("Remarks"), responsible: "Budget Manager", form: "R-3", desc: "Item Remarks" });
    return data;
  }

  getR4Fields(hierarchy: string[], item) {
    return [{ hierarchy: hierarchy.concat("Gantt Chart"), responsible: "Budget Manager", form: "R-4", desc: "A generated Gantt Chart" } ];
  }

  getR4AFields(hierarchy: string[], item) {
    return [{ hierarchy: hierarchy.concat("Schedule Details"), responsible: "Program Managers", form: "R-4A", desc: "Schedule Details from each program to generate a Gantt Chart" } ];
  }

  getItems() {

    return [
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
