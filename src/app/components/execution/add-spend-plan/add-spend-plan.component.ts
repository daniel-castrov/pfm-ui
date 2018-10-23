import { Component, OnInit, ViewChild, Input, setTestabilityGetter } from '@angular/core'

// Other Components
import { Router } from '@angular/router'
import { ProgramsService } from '../../../generated/api/programs.service';
import { GridOptions } from 'ag-grid';
import { AgGridNg2 } from 'ag-grid-angular';
import { ProgramCellRendererComponent } from '../../renderers/program-cell-renderer/program-cell-renderer.component';
import { ExecutionLine, OandEMonthly, Execution, ExecutionEvent } from '../../../generated';

@Component({
  selector: 'add-spend-plan',
  templateUrl: './add-spend-plan.component.html',
  styleUrls: ['./add-spend-plan.component.scss']
})

export class AddSpendPlanComponent implements OnInit {

  @ViewChild("agGrid") private agGrid: AgGridNg2;

  private agOptions: GridOptions;

  private firstMonth: number = 0;
  private _oandes: OandEMonthly[];
  private _exeline: ExecutionLine;
  private _exe: Execution;
  private _deltas: Map<Date, ExecutionEvent>;
  private columnDefs: any[];
  private rowData: DataRow[];

  @Input() set exeline(e: ExecutionLine) {
    this._exeline = e;
    this.refreshTableData();
  }

  get exeline(): ExecutionLine {
    return this._exeline;
  }

  @Input() set exe(e: Execution) {
    this._exe = e;
    this.firstMonth = 0;

    if (this.agOptions.api) {
      this.agOptions.api.refreshHeader();
    }
    this.refreshTableData();
  }

  get exe(): Execution {
    return this._exe;
  }

  @Input() set oandes(o: OandEMonthly[]) {
    this._oandes = o;
    this.refreshTableData();
  }

  get oandes() {
    return this._oandes;
  }

  @Input() set deltas(evs: Map<Date, ExecutionLine>) {
    this._deltas = evs;
    this.refreshTableData();
  }

  get deltas(): Map<Date, ExecutionLine> {
    return this._deltas;
  }

  ngOnInit() { }

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

    var my: AddSpendPlanComponent = this;
    var getter = function (p) {
      var row: number = p.node.rowIndex;
      var col: number = my.firstMonth + Number.parseInt(p.colDef.colId);
      return '(' + row + ',' + col + ')';
    }

    var setter = function (p) {
      var row: number = p.node.rowIndex;
      var col: number = my.firstMonth + Number.parseInt(p.colDef.colId);
      return true;
    }
    
    var getHeaderValueFy = function (p) {
      var inty: number = my.firstMonth / 12;
      return (my._exe ? 'FY' + (my.exe.fy + inty) : 'First Year');
    }

    this.columnDefs = [
      {
        headerName: 'After Appropriation',
        field: 'afterAppropriation',
        maxWidth: 320,
        children: [
          {
            headerName: 'Spend Plans',
            field: 'label',
            cellClass: ['ag-cell-white']
          },
        ],
      },
      {
        headerValueGetter: getHeaderValueFy,
        children: [
          {
            headerName: 'Oct',
            colId: 0,
            valueGetter: getter,
            editable: true,
            valueSetter: setter,
            cellClass: ['ag-cell-white', 'text-right']
          },
          {
            headerName: 'Nov',
            colId: 1,
            valueGetter: getter,
            valueSetter: setter,
            editable: true,
            cellClass: ['ag-cell-white', 'text-right']
          },
          {
            headerName: 'Dec',
            colId: 2,
            valueGetter: getter,
            editable: true,
            valueSetter: setter,
            cellClass: ['ag-cell-white', 'text-right']
          },
          {
            headerName: 'Jan',
            colId: 3,
            valueGetter: getter,
            editable: true,
            valueSetter: setter,
            cellClass: ['ag-cell-white', 'text-right']
          },
          {
            headerName: 'Feb',
            colId: 4,
            valueGetter: getter,
            editable: true,
            valueSetter: setter,
            cellClass: ['ag-cell-white', 'text-right']
          },
          {
            headerName: 'Mar',
            colId: 5,
            valueGetter: getter,
            editable: true,
            valueSetter: setter,
            cellClass: ['ag-cell-white', 'text-right']
          },
          {
            headerName: 'Apr',
            colId: 6,
            valueGetter: getter,
            valueSetter: setter,
            editable: true,
            cellClass: ['ag-cell-white', 'text-right']
          },
          {
            headerName: 'May',
            colId: 7,
            valueGetter: getter,
            editable: true,
            valueSetter: setter,
            cellClass: ['ag-cell-white', 'text-right']
          },
          {
            headerName: 'Jun',
            colId: 8,
            valueGetter: getter,
            editable: true,
            valueSetter: setter,
            cellClass: ['ag-cell-white', 'text-right']
          },
          {
            headerName: 'Jul',
            colId: 9,
            valueGetter: getter,
            editable: true,
            valueSetter: setter,
            cellClass: ['ag-cell-white', 'text-right']
          },
          {
            headerName: 'Aug',
            colId: 10,
            valueGetter: getter,
            editable: true,
            valueSetter: setter,
            cellClass: ['ag-cell-white', 'text-right']
          },
          {
            headerName: 'Sep',
            colId: 11,
            valueGetter: getter,
            editable: true,
            valueSetter: setter,
            cellClass: ['ag-cell-white', 'text-right']
          }
        ]
      }
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
    window.addEventListener("resize", function () {
      setTimeout(() => {
        params.api.sizeColumnsToFit();
      });
    });
  }

  refreshTableData() {
    var tmpdata:DataRow[] = [
      { label: 'Baseline', obligated: [], inhouse: [], contracted: [], expensed: [] },
      { label: 'Obligated', obligated: [], inhouse: [], contracted: [], expensed: [] },
      { label: 'In House/Other', obligated: [], inhouse: [], contracted: [], expensed: [] },
      { label: 'Contracted', obligated: [], inhouse: [], contracted: [], expensed: [] },
      { label: 'Expensed', obligated: [], inhouse: [], contracted: [], expensed: [] },
    ];

    this.rowData = tmpdata;
  }
}

interface DataRow {
  label: string,
  obligated: number[],
  inhouse: number[],
  contracted: number[],
  expensed: number[]
}
