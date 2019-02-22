import { Component, OnInit, ViewChild } from '@angular/core';

// Other Components
import { GridOptions } from 'ag-grid';
import { AgGridNg2 } from 'ag-grid-angular';

@Component({
  selector: 'import-acutals-table',
  templateUrl: './import-acutals-table.component.html',
  styleUrls: ['./import-acutals-table.component.scss']
})
export class ImportAcutalsTableComponent implements OnInit {

  @ViewChild("agGrid") private agGrid: AgGridNg2;

  private agOptions: GridOptions;
  // public rowData: any[];
  // public columnDefs: any[];

  columnDefs = [
    {
      headerName: 'Date', 
      field: 'date'
    },
    {
      headerName: 'Library file link', 
      field: 'library'
    },
    {
      headerName: 'Status', 
      field: 'status'
    },
    {
      headerName: 'Uploaded by', 
      field: 'uploaded'
    },
  ];

  rowData = [
      {
        date: 'Feb 12, 2019', 
        library: 'link to library', 
        status: 'success',
        uploaded: 'Beth Carrie'
      },
      {
        date: 'Feb 15, 2019', 
        library: 'another bad link to library', 
        status: 'failed',
        uploaded: 'Beth Carrie'
      },
      {
        date: 'Feb 20, 2019', 
        library: 'new link library', 
        status: 'failed',
        uploaded: 'Bill Andrew'
      },
      {
        date: 'Feb 22, 2019', 
        library: 'link to library', 
        status: 'success',
        uploaded: 'Bill Andrew'
      },
      {
        date: 'Feb 28, 2019', 
        library: 'link to library', 
        status: 'success',
        uploaded: 'Joseph Peter'
      },
  ];

  constructor() { 
  
   }
   
  ngOnInit() { }

  onSelectionChanged() {
    this.agOptions.api.getSelectedRows().forEach(row => {
      this.rowData = row;
    });
  }

  onGridReady(params) {
    setTimeout(() => {
      params.api.sizeColumnsToFit();
    }, 500);
    window.addEventListener("resize", function() {
      setTimeout(() => {
        params.api.sizeColumnsToFit();
      });
    });
  }
}
