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
import { ToaAndReleased, OandETools } from '../model/oande-tools';

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
  private _showpercentages: boolean = true;

  @Input() set showPercentages(perc: boolean) {
    this._showpercentages = perc;
    if (this.agOptions.api) {
      this.agOptions.api.redrawRows();
    }
  }

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

      var value: number = Number.parseFloat(p.newValue);
      if (my._showpercentages) {
        value *= p.data.toas[col] / 100;
      }

      my.rowData[row].values[col] = value;
      p.node.data.values[col] = value;

      my.rowData[1].values[col] = 0;
      for (var i = 2; i < 6; i++) {
        my.rowData[1].values[col] += my.rowData[i].values[col];
      }

      return true;
    }

    var get2 = function (p) {
      return (my.exeline && my.exeline.appropriated ? 'After Appropriation' : 'Baseline');
    }

    var formatter = function (p) {
      if ('' === p.value) {
        return '';
      }
      if (my._showpercentages) {
        var col: number = my.firstMonth + Number.parseInt(p.colDef.colId);
        var toa: number = p.data.toas[col];
        return (100 * p.value / toa).toFixed(2);
      }
      else {
        return p.value.toFixed(2);
      }
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
            fy: (my._exe ? my.exe.fy : 0),
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
            valueFormatter: formatter,
            cellEditorParams: { useFormatter: true },
            cellClass: ['ag-cell-white', 'text-right']
          },
          {
            headerName: 'Nov',
            colId: 1,
            valueGetter: getter,
            valueSetter: setter,
            cellEditorParams: { useFormatter: true },
            editable: p => (p.node.rowIndex > 1),
            valueFormatter: formatter,
            cellClass: ['ag-cell-white', 'text-right']
          },
          {
            headerName: 'Dec',
            colId: 2,
            valueGetter: getter,
            editable: p => (p.node.rowIndex > 1),
            valueSetter: setter,
            cellEditorParams: { useFormatter: true },
            valueFormatter: formatter,
            cellClass: ['ag-cell-white', 'text-right']
          },
          {
            headerName: 'Jan',
            colId: 3,
            valueGetter: getter,
            valueFormatter: formatter,
            cellEditorParams: { useFormatter: true },
            editable: p => (p.node.rowIndex > 1),
            valueSetter: setter,
            cellClass: ['ag-cell-white', 'text-right']
          },
          {
            headerName: 'Feb',
            colId: 4,
            valueGetter: getter,
            valueFormatter: formatter,
            editable: p => (p.node.rowIndex > 1),
            cellEditorParams: { useFormatter: true },
            valueSetter: setter,
            cellClass: ['ag-cell-white', 'text-right']
          },
          {
            headerName: 'Mar',
            colId: 5,
            valueGetter: getter,
            valueFormatter: formatter,
            editable: p => (p.node.rowIndex > 1),
            valueSetter: setter,
            cellEditorParams: { useFormatter: true },
            cellClass: ['ag-cell-white', 'text-right']
          },
          {
            headerName: 'Apr',
            colId: 6,
            valueGetter: getter,
            valueSetter: setter,
            valueFormatter: formatter,
            editable: p => (p.node.rowIndex > 1),
            cellEditorParams: { useFormatter: true },
            cellClass: ['ag-cell-white', 'text-right']
          },
          {
            headerName: 'May',
            colId: 7,
            valueGetter: getter,
            editable: p => (p.node.rowIndex > 1),
            valueSetter: setter,
            cellEditorParams: { useFormatter: true },
            valueFormatter: formatter,
            cellClass: ['ag-cell-white', 'text-right']
          },
          {
            headerName: 'Jun',
            colId: 8,
            valueGetter: getter,
            editable: p => (p.node.rowIndex > 1),
            valueSetter: setter,
            cellEditorParams: { useFormatter: true },
            valueFormatter: formatter,
            cellClass: ['ag-cell-white', 'text-right']
          },
          {
            headerName: 'Jul',
            colId: 9,
            valueGetter: getter,
            editable: p => (p.node.rowIndex > 1),
            cellEditorParams: { useFormatter: true },
            valueSetter: setter,
            valueFormatter: formatter,
            cellClass: ['ag-cell-white', 'text-right']
          },
          {
            headerName: 'Aug',
            colId: 10,
            valueGetter: getter,
            editable: p => (p.node.rowIndex > 1),
            cellEditorParams: { useFormatter: true },
            valueFormatter: formatter,
            valueSetter: setter,
            cellClass: ['ag-cell-white', 'text-right']
          },
          {
            headerName: 'Sep',
            colId: 11,
            valueGetter: getter,
            editable: p => (p.node.rowIndex > 1),
            cellEditorParams: { useFormatter: true },
            valueSetter: setter,
            valueFormatter: formatter,
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
        { label: (this.exeline && this.exeline.appropriated ? 'After Appropriation' : 'Baseline'), values: [], toas:[] },
        { label: 'Obligated', values: [], toas: [] },
        { label: 'Civilian Labor', values: [], toas: [] },
        { label: 'Travel', values: [], toas: [] },
        { label: 'Contracts', values: [], toas: [] },
        { label: 'Other', values: [], toas: [] },
        { label: 'Expensed', values: [], toas: [] },
      ];

      var progtype: string = this.exeline.appropriation;
      var ogoals: OSDGoalPlan = this.exe.osdObligationGoals[progtype];
      this.maxmonths = ogoals.monthlies.length;

      var toas: ToaAndReleased[] = OandETools.calculateToasAndReleaseds(this._exeline, this._deltas,
        this.maxmonths, this.exe.fy);

      for (var i = 0; i < this.maxmonths; i++) {
        tmpdata.forEach(row => {
          row.values.push(0);
          row.toas.push(toas[i].toa);
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
      monthlies: []
    };

    for (var i = 0; i < this.maxmonths; i++) {
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
  toas: number[],
  values: number[];
}
