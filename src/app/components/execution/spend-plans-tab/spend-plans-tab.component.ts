import { Component, OnInit, ViewChild } from '@angular/core'

// Other Components
import { Router } from '@angular/router'
import { GridOptions } from 'ag-grid';
import { AgGridNg2 } from 'ag-grid-angular';

@Component({
  selector: 'spend-plans-tab',
  templateUrl: './spend-plans-tab.component.html',
  styleUrls: ['./spend-plans-tab.component.scss']
})
export class SpendPlansTabComponent implements OnInit {

  @ViewChild("agGrid") private agGrid: AgGridNg2;

  private spendPlans: Map<string, string> = new Map<string, string>();
  private selectedRow: number = -1;
  private agOptions: GridOptions;
  private menuTabs = ['filterMenuTab'];

  constructor() { }

  ngOnInit() {}

    columnDefs = [
      {
        headerName: 'Spend Plans',
        field: 'spendPlans',
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
        {headerName: 'Dec',
        field: 'dec',
        maxWidth: 88,
        cellClass: ['ag-cell-white', 'text-right']
      },
        {headerName: 'Jan',
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
    ];

    rowData = [
        { spendPlans: 'Funds', mar: 'item 1', jun: 35000 },
        { spendPlans: 'Released', sept: 'item 1', aug: 500 },
        { spendPlans: 'Committed (Monthly)', dec: 'item 1', oct: 5550 },
        { spendPlans: 'Cummulative Committed', may: 'item 1', jul: 45000 },
        { spendPlans: 'Obligated (Monthly)', oct: 'item 1', feb: 50000 },
        { spendPlans: 'testing6', jan: 'item 1', nov: 70000 },
        { spendPlans: 'testing7', aug: 'item 1', dec: 745000 },
        { spendPlans: 'testing8', apr: 'item 1', aug: 590000 },
        { spendPlans: 'testing9', mar: 'item 1', sep: 69050 },
        { spendPlans: 'testing', mar: 'item 1', jun: 35000 },
        { spendPlans: 'testing2', sept: 'item 1', aug: 500 },
        { spendPlans: 'testing3', dec: 'item 1', oct: 5550 },
        { spendPlans: 'Obligated (Monthly)', oct: 'item 1', feb: 50000 },
        { spendPlans: 'testing6', jan: 'item 1', nov: 70000 },
        { spendPlans: 'testing7', aug: 'item 1', dec: 745000 },
        { spendPlans: 'testing8', apr: 'item 1', aug: 590000 },
        { spendPlans: 'testing9', mar: 'item 1', sep: 69050 },
        { spendPlans: 'testing', mar: 'item 1', jun: 35000 },
        { spendPlans: 'testing2', sept: 'item 1', aug: 500 },
        { spendPlans: 'testing3', dec: 'item 1', oct: 5550 },
        { spendPlans: 'Obligated (Monthly)', oct: 'item 1', feb: 50000 },
        { spendPlans: 'testing6', jan: 'item 1', nov: 70000 },
        { spendPlans: 'testing7', aug: 'item 1', dec: 745000 },
        { spendPlans: 'testing8', apr: 'item 1', aug: 590000 },
        { spendPlans: 'testing9', mar: 'item 1', sep: 69050 },
        { spendPlans: 'testing', mar: 'item 1', jun: 35000 },
        { spendPlans: 'testing2', sept: 'item 1', aug: 500 },
        { spendPlans: 'testing3', dec: 'item 1', oct: 5550 }
    ];

    onPageSizeChanged(event) {
      var selectedValue = Number(event.target.value);
      this.agGrid.api.paginationSetPageSize(selectedValue);
      this.agGrid.api.sizeColumnsToFit();
    }

    onSelectionChanged() {
      this.agOptions.api.getSelectedRows().forEach(row => {
        this.selectedRow = row;
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
