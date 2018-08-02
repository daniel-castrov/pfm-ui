import { Component, OnInit, ViewChild } from '@angular/core'

// Other Components
import { Router } from '@angular/router'
import { ProgramsService } from '../../../generated/api/programs.service';
import { GridOptions } from 'ag-grid';
import { AgGridNg2 } from 'ag-grid-angular';
import { ProgramCellRendererComponent } from '../../renderers/program-cell-renderer/program-cell-renderer.component';

@Component({
  selector: 'actuals-tab',
  templateUrl: './actuals-tab.component.html',
  styleUrls: ['./actuals-tab.component.scss']
})

export class ActualsTabComponent implements OnInit {

  @ViewChild("agGrid") private agGrid: AgGridNg2;

  private actuals: Map<string, string> = new Map<string, string>();
  private agOptions: GridOptions;
  private selectedRow: number = -1;
  private columnDefs: any[];
  private rowData: any[];

  ngOnInit() {}


  constructor() {

    this.columnDefs = [
      {
        headerName: 'First Year',
          children: [
            {
              headerName: 'Actuals',
              field: 'actuals',
              filter: 'agTextColumnFilter',
              cellClass: ['ag-cell-white']
            },
            {
              headerName: 'Oct',
              field: 'oct',
              maxWidth: 88,
              cellClass: ['ag-cell-white', 'text-right']
            },
            {
              headerName: 'Nov',
              field: 'nov',
              maxWidth: 88,
              cellClass: ['ag-cell-white', 'text-right']
            },
            {
              headerName: 'Dec',
              field: 'dec',
              maxWidth: 88,
              cellClass: ['ag-cell-white', 'text-right']
            },
            {
              headerName: 'Jan',
              field: 'jan',
              maxWidth: 88,
              cellClass: ['ag-cell-white', 'text-right']
            },
            {
              headerName: 'Feb',
              field: 'feb',
              maxWidth: 88,
              cellClass: ['ag-cell-white', 'text-right']
            },
            {
              headerName: 'Mar',
              field: 'mar',
              maxWidth: 80,
              cellClass: ['ag-cell-white', 'text-right']
            },
            {
              headerName: 'Apr',
              field: 'apr',
              maxWidth: 88,
              cellClass: ['ag-cell-white', 'text-right']
            },
            {
              headerName: 'May',
              field: 'may',
              maxWidth: 88,
              cellClass: ['ag-cell-white', 'text-right']
            },
            {
              headerName: 'Jun',
              field: 'jun',
              maxWidth: 88,
              cellClass: ['ag-cell-white', 'text-right']
            },
            {
              headerName: 'Jul',
              field: 'jul',
              maxWidth: 80,
              cellClass: ['ag-cell-white', 'text-right']
            },
            {
              headerName: 'Aug',
              field: 'aug',
              maxWidth: 88,
              cellClass: ['ag-cell-white', 'text-right']
            },
            {
              headerName: 'Sep',
              field: 'sep',
              maxWidth: 88,
              cellClass: ['ag-cell-white', 'text-right']
            }
          ]
        }
      ];

    this.rowData = [
        { actuals: 'Funds', mar: 'item 1', jun: 35000 },
        { actuals: 'Released', sept: 'item 1', aug: 500 },
        { actuals: 'Committed (Monthly)', dec: 'item 1', oct: 5550 },
        { actuals: 'Cummulative Committed', may: 'item 1', jul: 45000 },
        { actuals: 'Obligated (Monthly)', oct: 'item 1', feb: 50000 },
        { actuals: 'Cummulative Obligated', jan: 'item 1', nov: 70000 },
        { actuals: 'OSD Goal', aug: 'item 1', dec: 745000 },
        { actuals: 'Delta', apr: 'item 1', aug: 590000 },
        { actuals: 'Outlayed (Monthly)', oct: 'item 1', feb: 50000 },
        { actuals: 'Cummulative Outlayed', jan: 'item 1', nov: 70000 },
        { actuals: 'OSD Goal', aug: 'item 1', dec: 745000 },
        { actuals: 'Delta', apr: 'item 1', aug: 590000 },
        { actuals: 'Actulals (Monthly)', mar: 'item 1', sep: 69050 },
        { actuals: 'Cummulative Actuals', mar: 'item 1', jun: 35000 },
    ];

  }


  onPageSizeChanged(event) {
    var selectedValue = Number(event.target.value);
    this.agGrid.api.paginationSetPageSize(selectedValue);
    this.agGrid.api.sizeColumnsToFit();
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
