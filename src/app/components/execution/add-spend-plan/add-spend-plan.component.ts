import { Component, OnInit, ViewChild, Input, setTestabilityGetter, Output } from '@angular/core'

// Other Components
import { Router } from '@angular/router'
import { ProgramsService } from '../../../generated/api/programs.service';
import { GridOptions } from 'ag-grid';
import { AgGridNg2 } from 'ag-grid-angular';
import { ProgramCellRendererComponent } from '../../renderers/program-cell-renderer/program-cell-renderer.component';
import { ExecutionLine, OandEMonthly, Execution, ExecutionEvent, SpendPlan, OSDGoalPlan } from '../../../generated';
import { SpendPlansTabComponent } from '../spend-plans-tab/spend-plans-tab.component';
import { validateConfig } from '@angular/router/src/config';
import { FyHeaderComponent } from '../fy-header/fy-header.component';

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
  private maxmonths: number;

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

    var my: AddSpendPlanComponent = this;
    var getter = function (p) {
      var row: number = p.node.rowIndex;
      var col: number = my.firstMonth + Number.parseInt(p.colDef.colId);
      return (0 === row ? '' : my.rowData[row].values[col]);
    }

    var setter = function (p) {
      var row: number = p.node.rowIndex;
      var col: number = my.firstMonth + Number.parseInt(p.colDef.colId);
      my.rowData[row].values[col] = Number.parseFloat(p.newValue);
      p.node.data.values[col] = Number.parseFloat(p.newValue);

      my.rowData[1].values[col] = 0;
      for (var i = 2; i < 6; i++) {
        my.rowData[1].values[col] += my.rowData[i].values[col];
      }

      return true;
    }

    var get2 = function (p) {
      return (my.exeline && my.exeline.appropriated ? 'After Appropriation' : 'Baseline');
    }

    this.agOptions = <GridOptions>{
      enableColResize: true,
      enableSorting: false,
      enableFilter: false,
      gridAutoHeight: true,
      pagination: false,
      suppressPaginationPanel: true,
      toolPanelSuppressSideButtons: true,
      frameworkComponents: { fyheader: FyHeaderComponent },
      suppressDragLeaveHidesColumns: true,
      suppressMovableColumns: true,
      columnDefs: [{
        headerValueGetter: get2,
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
        headerGroupComponent: 'fyheader',
        headerGroupComponentParams: function () {
          return {
            firstMonth: my.firstMonth,
            maxMonths: my.maxmonths,
            fy: ( my._exe ? my.exe.fy : 0 ),
            next: function () { my.nextMonth() },
            prev: function () { my.prevMonth() }
          };
        },
        children: [
          {
            headerName: 'Oct',
            colId: 0,
            editable: p => (p.node.rowIndex > 1),
            valueGetter: getter,
            valueSetter: setter,
            valueFormatter: p => ('' === p.value ? '' : p.value.toFixed(2)),
            cellClass: ['ag-cell-white', 'text-right']
          },
          {
            headerName: 'Nov',
            colId: 1,
            valueGetter: getter,
            valueSetter: setter,
            editable: p => (p.node.rowIndex > 1),
            valueFormatter: p => ('' === p.value ? '' : p.value.toFixed(2)),
            cellClass: ['ag-cell-white', 'text-right']
          },
          {
            headerName: 'Dec',
            colId: 2,
            valueGetter: getter,
            editable: p => (p.node.rowIndex > 1),
            valueSetter: setter,
            valueFormatter: p => ('' === p.value ? '' : p.value.toFixed(2)),
            cellClass: ['ag-cell-white', 'text-right']
          },
          {
            headerName: 'Jan',
            colId: 3,
            valueGetter: getter,
            valueFormatter: p => ('' === p.value ? '' : p.value.toFixed(2)),
            editable: p => (p.node.rowIndex > 1),
            valueSetter: setter,
            cellClass: ['ag-cell-white', 'text-right']
          },
          {
            headerName: 'Feb',
            colId: 4,
            valueGetter: getter,
            valueFormatter: p => ('' === p.value ? '' : p.value.toFixed(2)),
            editable: p => (p.node.rowIndex > 1),
            valueSetter: setter,
            cellClass: ['ag-cell-white', 'text-right']
          },
          {
            headerName: 'Mar',
            colId: 5,
            valueGetter: getter,
            valueFormatter: p => ('' === p.value ? '' : p.value.toFixed(2)),
            editable: p => (p.node.rowIndex > 1),
            valueSetter: setter,
            cellClass: ['ag-cell-white', 'text-right']
          },
          {
            headerName: 'Apr',
            colId: 6,
            valueGetter: getter,
            valueSetter: setter,
            valueFormatter: p => ('' === p.value ? '' : p.value.toFixed(2)),
            editable: p => (p.node.rowIndex > 1),
            cellClass: ['ag-cell-white', 'text-right']
          },
          {
            headerName: 'May',
            colId: 7,
            valueGetter: getter,
            editable: p => (p.node.rowIndex > 1),
            valueSetter: setter,
            valueFormatter: p => ('' === p.value ? '' : p.value.toFixed(2)),
            cellClass: ['ag-cell-white', 'text-right']
          },
          {
            headerName: 'Jun',
            colId: 8,
            valueGetter: getter,
            editable: p => (p.node.rowIndex > 1),
            valueSetter: setter,
            valueFormatter: p => ('' === p.value ? '' : p.value.toFixed(2)),
            cellClass: ['ag-cell-white', 'text-right']
          },
          {
            headerName: 'Jul',
            colId: 9,
            valueGetter: getter,
            editable: p => (p.node.rowIndex > 1),
            valueSetter: setter,
            valueFormatter: p => ('' === p.value ? '' : p.value.toFixed(2)),
            cellClass: ['ag-cell-white', 'text-right']
          },
          {
            headerName: 'Aug',
            colId: 10,
            valueGetter: getter,
            editable: p => (p.node.rowIndex > 1),
            valueFormatter: p => ('' === p.value ? '' : p.value.toFixed(2)),
            valueSetter: setter,
            cellClass: ['ag-cell-white', 'text-right']
          },
          {
            headerName: 'Sep',
            colId: 11,
            valueGetter: getter,
            editable: p => (p.node.rowIndex > 1),
            valueSetter: setter,
            valueFormatter: p => ('' === p.value ? '' : p.value.toFixed(2)),
            cellClass: ['ag-cell-white', 'text-right']
          }
        ]
      }]
    }
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
    if (this._exe && this._exeline && this._oandes && this._deltas) {

      var tmpdata: DataRow[] = [
        { label: (this.exeline && this.exeline.appropriated ? 'After Appropriation' : 'Baseline'), values: [] },
        { label: 'Obligated', values: [] },
        { label: 'Civilian Labor', values: [] },
        { label: 'Travel', values: [] },
        { label: 'Contracts', values: [] },
        { label: 'Other', values: [] },
        { label: 'Expensed', values: [] },
      ];

      var progtype: string = this.exeline.appropriation;
      var ogoals: OSDGoalPlan = this.exe.osdObligationGoals[progtype];
      this.maxmonths = ogoals.monthlies.length;
      for (var i = 0; i < this.maxmonths; i++) {
        tmpdata.forEach(row => {
          row.values.push(0);
        });
      }
      this.rowData = tmpdata;

      this.agOptions.api.refreshHeader();
    }
  }

  getSpendPlan(): SpendPlan {
    var plan: SpendPlan = {
      type: ('Baseline' === this.rowData[0].label
        ? SpendPlan.TypeEnum.BASELINE
        : SpendPlan.TypeEnum.AFTERAPPROPRIATION),
      monthlies:[]
    };

    for (var i = 0; i < this.maxmonths; i++){
      plan.monthlies.push({
        labor: this.rowData[2].values[i],
        travel: this.rowData[3].values[i],
        contracts: this.rowData[4].values[i],
        other: this.rowData[5].values[i],
        expensed: this.rowData[6].values[i]
      });
    }

    return plan;
  }

  @Output() get valid(): boolean {
    var ok: boolean = false;
    if (this.rowData) {
      ok = true;
      this.rowData.forEach(row => {
        // is there anything to check here?
      });
    }
    return ok;
  }

  nextMonth() {
    this.firstMonth += 12;
    this.agOptions.api.redrawRows();
  }

  prevMonth() {
    this.firstMonth -= 12;
    this.agOptions.api.redrawRows();
  }
}

interface DataRow {
  label: string,
  values: number[];
}
