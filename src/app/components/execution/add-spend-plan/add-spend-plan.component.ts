import { Component, OnInit, ViewChild } from '@angular/core'

// Other Components
import { Router } from '@angular/router'
import { ProgramsService } from '../../../generated/api/programs.service';
import { GridOptions } from 'ag-grid';
import { AgGridNg2 } from 'ag-grid-angular';
import { ProgramCellRendererComponent } from '../../renderers/program-cell-renderer/program-cell-renderer.component';

@Component({
  selector: 'add-spend-plan',
  templateUrl: './add-spend-plan.component.html',
  styleUrls: ['./add-spend-plan.component.scss']
})

export class AddSpendPlanComponent implements OnInit {

  @ViewChild("agGrid") private agGrid: AgGridNg2;

  private spendplans: Map<string, string> = new Map<string, string>();
  private agOptions: GridOptions;
  private selectedRow: number = -1;
  private columnDefs: any[];
  private rowData: any[];

  ngOnInit() {}

  constructor() {

    this.agOptions = <GridOptions>{
      enableColResize: true,
      enableSorting: true,
      enableFilter: true,
      gridAutoHeight: true,
      pagination: true,
      paginationPageSize: 30,
      suppressPaginationPanel: true,
    }

    this.columnDefs = [
        {
          headerName: 'After Appropriation',
          maxWidth: 320,
          cellClass: ['ag-cell-white'],
          children: [
          {
            headerName: 'Spend Plans',
            field: 'spendplans',
            cellClass: ['ag-cell-white']
          },
        ],
      },
      {
        headerName: 'First Year',
        children: [
        {
          headerName: 'Oct',
          field: 'oct',
          cellClass: ['ag-cell-edit', 'text-right']
        },
        {
          headerName: 'Nov',
          field: 'nov',
          cellClass: ['ag-cell-edit', 'text-right']
        },
        {
          headerName: 'Dec',
          field: 'dec',
          cellClass: ['ag-cell-edit', 'text-right']
        },
        {
          headerName: 'Jan',
          field: 'jan',
          maxWidth: 80,
          cellClass: ['ag-cell-edit', 'text-right']
        },
        {
          headerName: 'Feb',
          field: 'feb',
          maxWidth: 80,
          cellClass: ['ag-cell-edit', 'text-right']
        },
        {
          headerName: 'Mar',
          field: 'mar',
          cellClass: ['ag-cell-edit', 'text-right']
        },
        {
          headerName: 'Apr',
          field: 'apr',
          cellClass: ['ag-cell-edit', 'text-right']
        },
        {
          headerName: 'May',
          field: 'may',
          cellClass: ['ag-cell-edit', 'text-right']
        },
        {
          headerName: 'Jun',
          field: 'jun',
          cellClass: ['ag-cell-edit', 'text-right']
        },
        {
          headerName: 'Jul',
          field: 'jul',
          cellClass: ['ag-cell-edit', 'text-right']
        },
        {
          headerName: 'Aug',
          field: 'aug',
          cellClass: ['ag-cell-edit', 'text-right']
        },
        {
          headerName: 'Sep',
          field: 'sep',
          cellClass: ['ag-cell-edit', 'text-right']
        }
      ]
    }
  ];
  this.rowData = [
      { spendplans1: 'Baseline', mar: 'item 1', jun: 35000 },
      { spendplans2: 'Obligated', sept: 'item 1', aug: 500 },
      { spendplans3: 'In House/Other', dec: 'item 1', oct: 5550 },
      { spendplans3: 'Contracted', may: 'item 1', jul: 45000 },
      { spendplans2: 'Outlayed', oct: 'item 1', feb: 50000 }
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
