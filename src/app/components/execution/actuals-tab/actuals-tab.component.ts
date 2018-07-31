import { Component, OnInit, ViewChild } from '@angular/core'

// Other Components
import { Router } from '@angular/router'
import { GridOptions } from 'ag-grid';
import { AgGridNg2 } from 'ag-grid-angular';

@Component({
  selector: 'actuals-tab',
  templateUrl: './actuals-tab.component.html',
  styleUrls: ['./actuals-tab.component.scss']
})
export class ActualsTabComponent implements OnInit {

  @ViewChild("agGrid") private agGrid: AgGridNg2;

  private actuals: Map<string, string> = new Map<string, string>();

  private agOptions: GridOptions;

  constructor() { }

  ngOnInit() {}

    columnDefs = [
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
        cellClass: ['ag-cell-white']
      },
      {
        headerName: 'Nov',
        field: 'nov',
        maxWidth: 88,
        cellClass: ['ag-cell-white']
      },
        {headerName: 'Dec',
        field: 'dec',
        maxWidth: 88,
        cellClass: ['ag-cell-white']
      },
        {headerName: 'Jan',
        field: 'jan',
        maxWidth: 88,
        cellClass: ['ag-cell-white']
      },
      {
        headerName: 'Feb',
        field: 'Feb',
        maxWidth: 88,
        cellClass: ['ag-cell-white']
      },
      {
        headerName: 'Mar',
        field: 'mar',
        maxWidth: 80,
        cellClass: ['ag-cell-white']
      },
      {
        headerName: 'Apr',
        field: 'apr',
        maxWidth: 88,
        cellClass: ['ag-cell-white']
      },
      {
        headerName: 'May',
        field: 'may',
        maxWidth: 88,
        cellClass: ['ag-cell-white']
      },
      {
        headerName: 'Jun',
        field: 'jun',
        maxWidth: 88,
        cellClass: ['ag-cell-white']
      },
      {
        headerName: 'Jul',
        field: 'jul',
        maxWidth: 80,
        cellClass: ['ag-cell-white']
      },
      {
        headerName: 'Aug',
        field: 'aug',
        maxWidth: 88,
        cellClass: ['ag-cell-white']
      },
      {
        headerName: 'Sep',
        field: 'sep',
        maxWidth: 88,
        cellClass: ['ag-cell-white']
      }
    ];

    rowData = [
        { actuals: 'Funds', mar: 'item 1', jun: 35000 },
        { actuals: 'Released', sept: 'item 1', aug: 500 },
        { actuals: 'Committed (Monthly)', dec: 'item 1', oct: 5550 },
        { actuals: 'Cummulative Committed', may: 'item 1', jul: 45000 },
        { actuals: 'Obligated (Monthly)', oct: 'item 1', feb: 50000 },
        { actuals: 'testing6', jan: 'item 1', nov: 70000 },
        { actuals: 'testing7', aug: 'item 1', dec: 745000 },
        { actuals: 'testing8', apr: 'item 1', aug: 590000 },
        { actuals: 'testing9', mar: 'item 1', sep: 69050 },
        { actuals: 'testing', mar: 'item 1', jun: 35000 },
        { actuals: 'testing2', sept: 'item 1', aug: 500 },
        { actuals: 'testing3', dec: 'item 1', oct: 5550 },
        { actuals: 'testing4', may: 'item 1', jul: 45000 },
        { actuals: 'testing5', oct: 'item 1', feb: 50000 },
        { actuals: 'testing6', jan: 'item 1', nov: 70000 },
        { actuals: 'testing7', aug: 'item 1', dec: 745000 },
        { actuals: 'testing8', apr: 'item 1', aug: 590000 },
        { actuals: 'testing9', mar: 'item 1', sep: 69050 },
        { actuals: 'testing', mar: 'item 1', jun: 35000 },
        { actuals: 'testing2', sept: 'item 1', aug: 500 },
        { actuals: 'testing3', dec: 'item 1', oct: 5550 },
        { actuals: 'testing4', may: 'item 1', jul: 45000 },
        { actuals: 'testing5', oct: 'item 1', feb: 50000 },
        { actuals: 'testing6', jan: 'item 1', nov: 70000 },
        { actuals: 'testing7', aug: 'item 1', dec: 745000 },
        { actuals: 'testing8', apr: 'item 1', aug: 590000 },
        { actuals: 'testing9', mar: 'item 1', sep: 69050 },
        { actuals: 'testing', mar: 'item 1', jun: 35000 },
        { actuals: 'testing2', sept: 'item 1', aug: 500 },
        { actuals: 'testing3', dec: 'item 1', oct: 5550 },
        { actuals: 'testing4', may: 'item 1', jul: 45000 },
        { actuals: 'testing5', oct: 'item 1', feb: 50000 },
        { actuals: 'testing6', jan: 'item 1', nov: 70000 },
        { actuals: 'testing7', aug: 'item 1', dec: 745000 },
        { actuals: 'testing8', apr: 'item 1', aug: 590000 },
        { actuals: 'testing9', mar: 'item 1', sep: 69050 },
        { actuals: 'testing', mar: 'item 1', jun: 35000 },
        { actuals: 'testing2', sept: 'item 1', aug: 500 },
        { actuals: 'testing3', dec: 'item 1', oct: 5550 },
        { actuals: 'testing4', may: 'item 1', jul: 45000 },
        { actuals: 'testing5', oct: 'item 1', feb: 50000 },
        { actuals: 'testing6', jan: 'item 1', nov: 70000 },
        { actuals: 'testing7', aug: 'item 1', dec: 745000 },
        { actuals: 'testing8', apr: 'item 1', aug: 590000 },
        { actuals: 'testing9', mar: 'item 1', sep: 69050 },
        { actuals: 'testing', mar: 'item 1', jun: 35000 },
        { actuals: 'testing2', sept: 'item 1', aug: 500 },
        { actuals: 'testing3', dec: 'item 1', oct: 5550 },
        { actuals: 'testing4', may: 'item 1', jul: 45000 },
        { actuals: 'testing5', oct: 'item 1', feb: 50000 },
        { actuals: 'testing6', jan: 'item 1', nov: 70000 },
        { actuals: 'testing7', aug: 'item 1', dec: 745000 },
        { actuals: 'testing8', apr: 'item 1', aug: 590000 },
        { actuals: 'testing9', mar: 'item 1', sep: 69050 },
        { actuals: 'testing', mar: 'item 1', jun: 35000 },
        { actuals: 'testing2', sept: 'item 1', aug: 500 },
        { actuals: 'testing3', dec: 'item 1', oct: 5550 },
        { actuals: 'testing4', may: 'item 1', jul: 45000 },
        { actuals: 'testing5', oct: 'item 1', feb: 50000 },
        { actuals: 'testing6', jan: 'item 1', nov: 70000 },
        { actuals: 'testing7', aug: 'item 1', dec: 745000 },
        { actuals: 'testing8', apr: 'item 1', aug: 590000 },
        { actuals: 'testing9', mar: 'item 1', sep: 69050 }

    ];

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
