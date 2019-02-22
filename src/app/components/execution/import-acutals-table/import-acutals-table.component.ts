import { Component, OnInit, ViewChild } from '@angular/core';

// Other Components
import { GridOptions } from 'ag-grid';
import { AgGridNg2 } from 'ag-grid-angular';


@Component({
  selector: 'app-import-acutals-table',
  templateUrl: './import-acutals-table.component.html',
  styleUrls: ['./import-acutals-table.component.scss']
})
export class ImportAcutalsTableComponent implements OnInit {

  @ViewChild("agGrid") private agGrid: AgGridNg2;

  private agOptions: GridOptions;


  constructor() { }

  ngOnInit() {
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

  onSelectionChanged() {
    this.agOptions.api.getSelectedRows().forEach(row => {
      this.selectedRow = row;
    });
  }

  onPageSizeChanged(event) {
    var selectedValue = Number(event.target.value);
    this.agGrid.api.paginationSetPageSize(selectedValue);
    this.agGrid.api.sizeColumnsToFit();
  }

}
