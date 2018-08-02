import { Component, OnInit, ViewChild } from '@angular/core'

// Other Components
import { Router } from '@angular/router'
import { ProgramsService } from '../../../generated/api/programs.service';
import { GridOptions } from 'ag-grid';
import { AgGridNg2 } from 'ag-grid-angular';
import { ProgramCellRendererComponent } from '../../renderers/program-cell-renderer/program-cell-renderer.component';

@Component({
  selector: 'spend-plans-tab',
  templateUrl: './spend-plans-tab.component.html',
  styleUrls: ['./spend-plans-tab.component.scss']
})
export class SpendPlansTabComponent implements OnInit {



  @ViewChild("agGrid") private agGrid: AgGridNg2;

  private spendplans: Map<string, string> = new Map<string, string>();
  private selectedRow: number = -1;
  private columnDefs: any[];
  private rowData: any[];

  ngOnInit() {}

  constructor() {
    this.columnDefs = [
      {
        headerName: 'RDT&E',
        maxWidth: 320,
        cellClass: ['ag-cell-white'],
        children: [
        {
          headerName: 'Spend Plans',
          field: 'spendplans',
          cellClass: ['ag-cell-white'],
          children: [
            {
              field: 'spendplans1',
              cellClass: ['ag-cell-white']
            },
            {
              field: 'spendplans2',
              cellClass: ['ag-cell-white','text-center']
            },
            {
              field: 'spendplans3',
              cellClass: ['ag-cell-white','text-right']
            }
          ]
        },
      ],
    },
    {
      headerName: 'First Year',
      children: [
      {
        headerName: 'Oct',
        field: 'oct',
        cellClass: ['ag-cell-white', 'text-right']
      },
      {
        headerName: 'Nov',
        field: 'nov',
        cellClass: ['ag-cell-white', 'text-right']
      },
      {
        headerName: 'Dec',
        field: 'dec',
        cellClass: ['ag-cell-white', 'text-right']
      },
      {
        headerName: 'Jan',
        field: 'jan',
        maxWidth: 80,
        cellClass: ['ag-cell-white', 'text-right']
      },
      {
        headerName: 'Feb',
        field: 'feb',
        maxWidth: 80,
        cellClass: ['ag-cell-white', 'text-right']
      },
      {
        headerName: 'Mar',
        field: 'mar',
        cellClass: ['ag-cell-white', 'text-right']
      },
      {
        headerName: 'Apr',
        field: 'apr',
        cellClass: ['ag-cell-white', 'text-right']
      },
      {
        headerName: 'May',
        field: 'may',
        cellClass: ['ag-cell-white', 'text-right']
      },
      {
        headerName: 'Jun',
        field: 'jun',
        cellClass: ['ag-cell-white', 'text-right']
      },
      {
        headerName: 'Jul',
        field: 'jul',
        cellClass: ['ag-cell-white', 'text-right']
      },
      {
        headerName: 'Aug',
        field: 'aug',
        cellClass: ['ag-cell-white', 'text-right']
      },
      {
        headerName: 'Sep',
        field: 'sep',
        cellClass: ['ag-cell-white', 'text-right']
      }
    ]
  }
];

    this.rowData = [
        { spendplans1: 'Baseline', mar: 'item 1', jun: 35000 },
        { spendplans2: 'Obligated', sept: 'item 1', aug: 500 },
        { spendplans3: 'In House/Other', dec: 'item 1', oct: 5550 },
        { spendplans3: 'Contracted', may: 'item 1', jul: 45000 },
        { spendplans2: 'Outlayed', oct: 'item 1', feb: 50000 },
        { spendplans3: 'Cummulative Obligated', jan: 'item 1', nov: 7000 },
        { spendplans1: 'In House', aug: 'item 1', dec: 7450 },
        { spendplans2: 'Delta', apr: 'item 1', aug: 5900 },
        { spendplans3: 'Outlayed (Monthly)', oct: 'item 1', feb: 50000 },
        { spendplans1: 'Cummulative Outlayed', jan: 'item 1', nov: 70000 },
        { spendplans2: 'OSD Goal', aug: 'item 1', dec: 7000 },
        { spendplans3: 'Delta', apr: 'item 1', aug: 59000 },
        { spendplans1: 'Actulals (Monthly)', mar: 'item 1', sep: 69050 },
        { spendplans2: 'Cummulative Actuals', mar: 'item 1', jun: 35000 }
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
