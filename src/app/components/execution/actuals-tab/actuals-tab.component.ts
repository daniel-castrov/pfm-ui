import { Component, OnInit, ViewChild, Input } from '@angular/core'
import { Observable } from 'rxjs';

// Other Components
import { GridOptions, CellEditingStartedEvent, CellEditingStoppedEvent } from 'ag-grid';
import { AgGridNg2 } from 'ag-grid-angular';

import { OandEMonthly, ExecutionLine, Execution, ExecutionEvent, OandEService, OSDGoalPlan } from '../../../generated';
import { ActualsCellRendererComponent } from '../actuals-cell-renderer/actuals-cell-renderer.component';
import { OandETools, ToaAndReleased } from '../model/oande-tools';
import { Notify } from '../../../utils/Notify';
import { FyHeaderComponent } from '../fy-header/fy-header.component';

declare const $: any;

@Component({
  selector: 'actuals-tab',
  templateUrl: './actuals-tab.component.html',
  styleUrls: ['./actuals-tab.component.scss']
})

// WARNING: This class relied HEAVILY on the order of rows.
//          Do not change the order willy-nilly
//
//          ROWS 0 and 1 come from the ExecutionLine
//          ROWS 2, 4, 8, and 12 come from the O&Es
//          The other rows are calculated values
export class ActualsTabComponent implements OnInit {

  @ViewChild("agGrid") private agGrid: AgGridNg2;
  @Input() parent: any;
  private _oandes: OandEMonthly[];
  private _exeline: ExecutionLine;
  private _exe: Execution;
  private _deltas: Map<Date, ExecutionEvent>;
  private agOptions: GridOptions;
  rows: ActualsRow[];
  firstMonth = 0;
  editMonth: number = -1;
  isadmin: boolean = false;
  showPercentages: boolean = true;
  prevok: boolean = false;
  nextok: boolean = true;
  remediation: string;
  explanation: string;
  fixtime: number = 1;
  private maxmonths: number;

  @Input() set exeline(e: ExecutionLine) {
    //console.log('setting exeline')
    this._exeline = e;
    this.refreshTableData();
  }

  get exeline(): ExecutionLine {
    return this._exeline;
  }

  @Input() set exe(e: Execution) {
    //console.log('setting exe');
    this._exe = e;
    this.firstMonth = 0;

    var date = new Date();
    var day = date.getDay();

    this.editMonth = OandETools.convertDateToFyMonth((e ? e.fy : 0), date);

    // after the 14th, we're on to the next month
    if (day >= 15) {
      this.editMonth += 1;
    }

    // skip to the FY that contains the current month
    this.firstMonth = (this.editMonth / 12) * 12;

    if (this.agOptions.api) {
      this.agOptions.api.refreshHeader();
    }

    this.refreshTableData();
  }

  get exe(): Execution {
    return this._exe;
  }

  @Input() set oandes(o: OandEMonthly[]) {
    //console.log('setting oandes ' + JSON.stringify(o));
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

  constructor(private oandesvc: OandEService) {
    var my: ActualsTabComponent = this;

    var editrows: Set<number> = new Set<number>([2, 4, 8, 12]);

    var editsok = function (params) {
      var colOk: boolean = (my.isadmin
        ? true
        : (my.firstMonth + params.colDef.colId) === my.editMonth);
      var rowOk: boolean = editrows.has(params.node.rowIndex);

      return (rowOk && colOk);
    }

    var valueSetter = function (params) {
      // col is the index of the values array of the data (e.g., 0-36 for a 3-year cycle)
      var col: number = Number.parseInt(params.colDef.colId) + my.firstMonth;
      var row: number = params.node.childIndex;

      var oldval: number = Number.parseFloat(params.oldValue);
      var newval: number = Number.parseFloat(params.newValue);

      if (my.showPercentages) {
        newval = newval * my.rows[row].toa[col] / 100;
      }

      my.rows[row].values[col] = newval;

      for (var i = col; col < my.rows.values.length; i++) {
        my.rows[row + 1].values[i] = my.rows[row + 1].values[i] - oldval + newval;
      }

      my.recalculateTableData();
      return true;
    }

    function isPctInRange(data: ActualsRow, row: number, fymonth: number, cutoff: number[]): boolean {
      if (my.rows && data && (my.isadmin || fymonth <= my.editMonth)) {
        // if we're in a red/yellow/green cell, then the previous row is the "goal" row,
        // and the value we want to check is the one before that ("cumulative")
        var pct: number = my.rows[row - 2].values[fymonth] / data.toa[fymonth];
        var goal: number = (7 === row
          ? data.oblgoal_pct[fymonth]
          : data.expgoal_pct[fymonth]);

        var diff: number = (goal - pct) * 100;
        var low: number = cutoff[0];
        var high: number = cutoff[1];

        return (diff >= low && diff < high);
      }

      return false;
    }

    var isyellow = function (params): boolean {
      return ( 7 === params.rowIndex || 11 === params.rowIndex
        ? isPctInRange(params.data, params.rowIndex, my.firstMonth + params.colDef.colId, [0,10.0001])
        : false);
    }

    var isred = function (params): boolean {
      return (7 === params.rowIndex || 11 === params.rowIndex
        ? isPctInRange(params.data, params.rowIndex, my.firstMonth + params.colDef.colId, [10, 1000])
        : false);
    }

    var isgreen = function (params): boolean {
      return (7 === params.rowIndex || 11 === params.rowIndex
        ? isPctInRange(params.data, params.rowIndex, my.firstMonth + params.colDef.colId, [-1000, 0.0001])
        : false);
    }

    var getHeaderValue = function (params) {
      var inty: number = my.firstMonth / 12;
      return (my.exe ? 'FY' + (my.exe.fy + inty) : 'First Year');
    }

    var formatter = function (p): any {
      if (my.showPercentages) {
        var col: number = my.firstMonth + Number.parseInt(p.colDef.colId);
        return (p.node.data.values[col] / p.node.data.toa[col] * 100).toFixed(2);
      }
      return p.value;
    }

    var agcomps: any = {
      actualsRenderer: ActualsCellRendererComponent,
      fyheader: FyHeaderComponent
    };

    var cssbold: Set<number> = new Set<number>([0, 1, 3, 5, 6, 7, 9, 10, 11, 13]);
    var cssright: Set<number> = new Set<number>([3, 5, 6, 7, 9, 10, 11, 13]);

    this.agOptions = <GridOptions>{
      rowData: this.rows,
      frameworkComponents: agcomps,
      context: {
        parent: my
      },
      columnDefs: [
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
              headerName: 'Actuals',
              field: 'label',
              filter: 'agTextColumnFilter',
              cellClass: ['ag-cell-white'],
              width: 240,
              cellClassRules: {
                'text-right': params => cssright.has(params.node.rowIndex),
                'font-weight-bold': params => cssbold.has(params.node.rowIndex),
                'ag-cell-yellow': isyellow,
                'ag-cell-red': isred,
                'ag-cell-dark-green': isgreen
              }
            },
            {
              headerName: 'Oct',
              colId: 0,
              valueGetter: params => my.valueGetter(params),
              editable: editsok,
              valueSetter: valueSetter,
              type: 'numericColumn',
              cellRenderer: 'actualsRenderer',
              valueFormatter: p => formatter(p),
              cellEditorParams: { useFormatter: true },
              width: 88,
              cellClassRules: {
                'ag-cell-edit': editsok,
                'ag-cell-light-green': p => (!editsok(p)),
                'ag-cell-yellow': isyellow,
                'ag-cell-red': isred,
                'ag-cell-dark-green': isgreen
              }
            },
            {
              headerName: 'Nov',
              colId: 1,
              type: 'numericColumn',
              editable: editsok,
              valueFormatter: p => formatter(p),
              cellEditorParams: { useFormatter: true },
              valueSetter: valueSetter,
              valueGetter: params => my.valueGetter(params),
              cellRenderer: 'actualsRenderer',
              width: 88,
              cellClassRules: {
                'ag-cell-edit': editsok,
                'ag-cell-light-green': p => (!editsok(p)),
                'ag-cell-yellow': isyellow,
                'ag-cell-red': isred,
                'ag-cell-dark-green': isgreen
              }
            },
            {
              headerName: 'Dec',
              colId: 2,
              editable: editsok,
              valueGetter: params => my.valueGetter(params),
              valueFormatter: p => formatter(p),
              cellEditorParams: { useFormatter: true },
              type: 'numericColumn',
              valueSetter: valueSetter,
              cellRenderer: 'actualsRenderer',
              width: 88,
              cellClassRules: {
                'ag-cell-edit': editsok,
                'ag-cell-light-green': p => (!editsok(p)),
                'ag-cell-yellow': isyellow,
                'ag-cell-red': isred,
                'ag-cell-dark-green': isgreen
              }
            },
            {
              headerName: 'Jan',
              colId: 3,
              valueSetter: valueSetter,
              editable: editsok,
              valueFormatter: p => formatter(p),
              cellEditorParams: { useFormatter: true },
              valueGetter: params => my.valueGetter(params),
              cellRenderer: 'actualsRenderer',
              type: 'numericColumn',
              width: 90,
              cellClassRules: {
                'ag-cell-edit': editsok,
                'ag-cell-light-green': p => (!editsok(p)),
                'ag-cell-yellow': isyellow,
                'ag-cell-red': isred,
                'ag-cell-dark-green': isgreen
              }
            },
            {
              headerName: 'Feb',
              colId: 4,
              valueSetter: valueSetter,
              editable: editsok,
              valueFormatter: p => formatter(p),
              cellEditorParams: { useFormatter: true },
              valueGetter: params => my.valueGetter(params),
              cellRenderer: 'actualsRenderer',
              width: 88,
              type: 'numericColumn',
              cellClassRules: {
                'ag-cell-edit': editsok,
                'ag-cell-light-green': p => (!editsok(p)),
                'ag-cell-yellow': isyellow,
                'ag-cell-red': isred,
                'ag-cell-dark-green': isgreen
              }
            },
            {
              headerName: 'Mar',
              colId: 5,
              editable: editsok,
              valueFormatter: p => formatter(p),
              cellEditorParams: { useFormatter: true },
              valueSetter: valueSetter,
              cellRenderer: 'actualsRenderer',
              valueGetter: params => my.valueGetter(params),
              type: 'numericColumn',
              width: 82,
              cellClassRules: {
                'ag-cell-edit': editsok,
                'ag-cell-light-green': p => (!editsok(p)),
                'ag-cell-yellow': isyellow,
                'ag-cell-red': isred,
                'ag-cell-dark-green': isgreen
              }
            },
            {
              editable: editsok,
              headerName: 'Apr',
              colId: 6,
              valueSetter: valueSetter,
              cellRenderer: 'actualsRenderer',
              valueFormatter: p => formatter(p),
              cellEditorParams: { useFormatter: true },
              type: 'numericColumn',
              valueGetter: params => my.valueGetter(params),
              width: 88,
              cellClassRules: {
                'ag-cell-edit': editsok,
                'ag-cell-light-green': p => (!editsok(p)),
                'ag-cell-yellow': isyellow,
                'ag-cell-red': isred,
                'ag-cell-dark-green': isgreen
              }
            },
            {
              editable: editsok,
              headerName: 'May',
              colId: 7,
              valueFormatter: p => formatter(p),
              cellEditorParams: { useFormatter: true },
              valueGetter: params => my.valueGetter(params),
              valueSetter: valueSetter,
              cellRenderer: 'actualsRenderer',
              type: 'numericColumn',
              width: 88,
              cellClassRules: {
                'ag-cell-edit': editsok,
                'ag-cell-light-green': p => (!editsok(p)),
                'ag-cell-yellow': isyellow,
                'ag-cell-red': isred,
                'ag-cell-dark-green': isgreen
              }
            },
            {
              headerName: 'Jun',
              colId: 8,
              valueFormatter: p => formatter(p),
              cellEditorParams: { useFormatter: true },
              editable: editsok,
              valueGetter: params => my.valueGetter(params),
              type: 'numericColumn',
              valueSetter: valueSetter,
              cellRenderer: 'actualsRenderer',
              width: 88,
              cellClassRules: {
                'ag-cell-edit': editsok,
                'ag-cell-light-green': p => (!editsok(p)),
                'ag-cell-yellow': isyellow,
                'ag-cell-red': isred,
                'ag-cell-dark-green': isgreen
              }
            },
            {
              headerName: 'Jul',
              colId: 9,
              valueFormatter: p => formatter(p),
              cellEditorParams: { useFormatter: true },
              editable: editsok,
              valueGetter: params => my.valueGetter(params),
              cellRenderer: 'actualsRenderer',
              valueSetter: valueSetter,
              width: 82,
              type: 'numericColumn',
              cellClassRules: {
                'ag-cell-edit': editsok,
                'ag-cell-light-green': p => (!editsok(p)),
                'ag-cell-yellow': isyellow,
                'ag-cell-red': isred,
                'ag-cell-dark-green': isgreen
              }
            },
            {
              headerName: 'Aug',
              colId: 10,
              editable: editsok,
              valueGetter: params => my.valueGetter(params),
              valueFormatter: p => formatter(p),
              cellEditorParams: { useFormatter: true },
              cellRenderer: 'actualsRenderer',
              width: 88,
              type: 'numericColumn',
              valueSetter: valueSetter,
              cellClassRules: {
                'ag-cell-edit': editsok,
                'ag-cell-light-green': p => (!editsok(p)),
                'ag-cell-yellow': isyellow,
                'ag-cell-red': isred,
                'ag-cell-dark-green': isgreen
              }
            },
            {
              headerName: 'Sep',
              colId: 11,
              editable: editsok,
              cellRenderer: 'actualsRenderer',
              valueGetter: params => my.valueGetter(params),
              valueFormatter: p => formatter(p),
              cellEditorParams: { useFormatter: true },
              width: 88,
              valueSetter: valueSetter,
              type: 'numericColumn',
              cellClassRules: {
                'ag-cell-edit': editsok,
                'ag-cell-light-green': p => (!editsok(p)),
                'ag-cell-yellow': isyellow,
                'ag-cell-red': isred,
                'ag-cell-dark-green': isgreen
              }
            }
          ]
        }
      ]
    };
  }

  ngOnInit() {
  }

  /**
   * Refreshes the table data when a new exe, exeline, or oandes is loaded.
   * Use recalculateTableData() if you just want to respond to user inputs
   */
  refreshTableData() {
    this.rows = [
      { label: 'TOA', values: [], toa: [], released: [], oblgoal_pct: [], expgoal_pct: [] },
      { label: 'Released', values: [], toa: [], released: [], oblgoal_pct: [], expgoal_pct: [] },
      { label: 'Committed (Monthly)', values: [], toa: [], released: [], oblgoal_pct: [], expgoal_pct: [] },
      { label: 'Cumulative Committed', values: [], toa: [], released: [], oblgoal_pct: [], expgoal_pct: [] },
      { label: 'Obligated (Monthly)', values: [], toa: [], released: [], oblgoal_pct: [], expgoal_pct: [] },
      { label: 'Cumulative Obligated', values: [], toa: [], released: [], oblgoal_pct: [], expgoal_pct: [] },
      { label: 'OUSD(C) Goal', values: [], toa: [], released: [], oblgoal_pct: [], expgoal_pct: [] },
      { label: 'Delta', values: [], toa: [], released: [], oblgoal_pct: [], expgoal_pct: [] },
      { label: 'Expensed (Monthly)', values: [], toa: [], released: [], oblgoal_pct: [], expgoal_pct: [] },
      { label: 'Cumulative Expensed', values: [], toa: [], released: [], oblgoal_pct: [], expgoal_pct: [] },
      { label: 'OUSD(C) Goal', values: [], toa: [], released: [], oblgoal_pct: [], expgoal_pct: [] },
      { label: 'Delta', values: [], toa: [], released: [], oblgoal_pct: [], expgoal_pct: [] },
      { label: 'Accruals (Monthly)', values: [], toa: [], released: [], oblgoal_pct: [], expgoal_pct: [] },
      { label: 'Cumulative Actuals', values: [], toa: [], released: [], oblgoal_pct: [], expgoal_pct: [] },
    ];

    if (this._exeline && this._exe && this._oandes && this._deltas) {
      // get our goals information
      var progtype: string = this.exeline.appropriation;
      var ogoals: OSDGoalPlan = this.exe.osdObligationGoals[progtype];
      var egoals: OSDGoalPlan = this.exe.osdExpenditureGoals[progtype];

      this.maxmonths = Math.max(ogoals.monthlies.length, egoals.monthlies.length);
      // get our O&E values in order of month, so we can
      // run right through them
      var myoandes: OandEMonthly[] = new Array(this.maxmonths);
      this.oandes.forEach(oande => {
        myoandes[oande.month] = oande;
      });

      this.rows.forEach(ar => {
        for (var i = 0; i < this.maxmonths; i++) {
          ar.toa.push(0);
          ar.released.push(0);

          ar.expgoal_pct.push(egoals.monthlies.length > i ? egoals.monthlies[i] : 1);
          ar.oblgoal_pct.push(ogoals.monthlies.length > i ? ogoals.monthlies[i] : 1);
        }
      });

      for (var i = 0; i < this.maxmonths; i++) {
        this.rows[0].values.push(0);
        this.rows[1].values.push(0);

        this.rows[2].values.push(myoandes[i] ? myoandes[i].committed : 0);
        this.rows[3].values.push(0);

        this.rows[4].values.push(myoandes[i] ? myoandes[i].obligated : 0);

        this.rows[5].values.push(0);
        this.rows[6].values.push(0);
        this.rows[7].values.push(0);

        this.rows[8].values.push(myoandes[i] ? myoandes[i].expensed : 0);

        this.rows[9].values.push(0);
        this.rows[10].values.push(0);
        this.rows[11].values.push(0);

        this.rows[12].values.push(myoandes[i] ? myoandes[i].accruals : 0);

        this.rows[13].values.push(0);
      }

      this.recalculateTableData(); // this handles the call to setRowData(), too

    } else if (this.agOptions.api) {
      this.agOptions.api.setRowData(this.rows);
    }

    this.enableNextPrevButtons();
  }

  recalculateTableData() {
    // get our goals information
    var progtype: string = this.exeline.appropriation;
    var ogoals: OSDGoalPlan = this.exe.osdObligationGoals[progtype];
    var egoals: OSDGoalPlan = this.exe.osdExpenditureGoals[progtype];

    var committed: number = 0;
    var obligated: number = 0;
    var expensed: number = 0;
    var accruals: number = 0;

    // go through all our deltas and calculate toas and released
    var toasAndReleaseds: ToaAndReleased[]
      = OandETools.calculateToasAndReleaseds(this.exeline, this.deltas,
        this.rows[0].values.length, this.exe.fy);

    for (var i = 0; i < this.rows[0].values.length; i++) {
      // all rows need to know about toa and released values
      // so the renderer can calculate *either* % or $
      for (var j = 0; j < this.rows.length; j++) {
        this.rows[j].toa[i] = toasAndReleaseds[i].toa;
        this.rows[j].released[i] = toasAndReleaseds[i].released;
      }

      var toa: number = toasAndReleaseds[i].toa;
      var released: number = toasAndReleaseds[i].released;

      this.rows[0].values[i] = toa;
      this.rows[1].values[i] = released;

      committed += this.rows[2].values[i];
      this.rows[3].values[i] = committed;

      obligated += this.rows[4].values[i];
      this.rows[5].values[i] = obligated;

      if (i < ogoals.monthlies.length) {
        this.rows[6].values[i] = toa * ogoals.monthlies[i];
        this.rows[7].values[i] = this.rows[6].values[i] - obligated;
      }

      expensed += this.rows[8].values[i];
      this.rows[9].values[i] = expensed;

      if (i < egoals.monthlies.length) {
        this.rows[10].values[i] = toa * egoals.monthlies[i];
        this.rows[11].values[i] = this.rows[10].values[i] - expensed;
      }

      accruals += this.rows[12].values[i];
      this.rows[13].values[i] = accruals;
    }

    if (this.agOptions.api) {
      this.agOptions.api.setRowData(this.rows);
    }
  }

  valueGetter(params) {
    var my: ActualsTabComponent = this;

    // first, figure out which column we're in so we know which month to get
    // col will be from 0-11, representing the months of the FY
    // (remember: 0=October, not January)
    var col: number = params.colDef.colId;
    var row: number = params.node.childIndex;

    var index: number = my.firstMonth + col;
    //if(6===row && 1===col) console.log('value getter for (' + row + ',' + col + '); index is: ' + index + '; vlen:' + params.data.values.length);
    if (params.data.values.length >= index) {
      //console.log(params.data.values);
      //if( 6===row && 1 === col ) console.log('  returning ' + params.data.values[index]);
      return params.data.values[index];
    }
    else {
      // just a fallback value
      return 0;
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

  @Input() set percentages(p: boolean) {
    this.showPercentages = p;
    if (this.agOptions.api) {
      this.agOptions.api.redrawRows();
    }
  }

  onToggleAdmin() {
    this.isadmin = !this.isadmin;
    this.agOptions.api.redrawRows();
  }

  prevMonth() {
    if (this.firstMonth - 12 >= 0) {
      this.firstMonth -= 12;
      this.agOptions.api.refreshHeader();
      this.agOptions.api.redrawRows();
    }

    this.enableNextPrevButtons();
  }

  nextMonth() {
    if (this.firstMonth + 12 < this.rows[0].values.length) {
      this.firstMonth += 12;
      this.agOptions.api.refreshHeader();
      this.agOptions.api.redrawRows();
    }
    this.enableNextPrevButtons();
  }

  enableNextPrevButtons() {
    this.prevok = (this.firstMonth - 12 >= 0);
    this.nextok = (this.firstMonth + 12 < this.rows[0].values.length);
  }

  monthlies() : Observable<OandEMonthly[]> {
    var my: ActualsTabComponent = this;
    return new Observable<OandEMonthly[]>(obs => {
      if (this.isadmin) {
        var data: OandEMonthly[] = [];

        var rowsToCheck: number[] = [2, 4, 8, 12];

        for (var i = 0; i < this.rows[0].values.length; i++) {
          var okToAdd: boolean = false;

          rowsToCheck.forEach(val => {
            if (my.rows[val].values[i] && 0 !== my.rows[val].values[i]) {
              okToAdd = true;
            }
          });

          if (okToAdd) {
            var exline: OandEMonthly = {
              executionLineId: this.exeline.id,
              month: i,
              committed: my.rows[2].values[i],
              obligated: my.rows[4].values[i],
              expensed: my.rows[8].values[i],
              accruals: my.rows[12].values[i]
            };

            data.push(exline);
          }
        }
        obs.next(data);
        obs.complete();
      }
      else {
        var toa: number = this.rows[0].values[this.editMonth];
        var opct: number = (this.rows[6].values[this.editMonth] - this.rows[5].values[this.editMonth])/toa;
        var epct: number = (this.rows[10].values[this.editMonth] - this.rows[9].values[this.editMonth])/toa;

        var oande: OandEMonthly = {
          executionLineId: this.exeline.id,
          month: this.editMonth,
          committed: this.rows[2].values[this.editMonth],
          obligated: this.rows[4].values[this.editMonth],
          expensed: this.rows[8].values[this.editMonth],
          accruals: this.rows[12].values[this.editMonth]
        };

        if (opct >= 0.0 || epct >= 0.0) {
          $('#explanation-modal').on('hidden.bs.modal', function (event) {
            oande.monthsToFix = my.fixtime;
            oande.explanation = my.explanation;
            oande.remediation = my.remediation;

            obs.next([oande]);
            obs.complete();
            $('#explanation-modal').unbind('hidden.bs.modal');
          }).modal('show');
        }
        else {
          obs.next([oande]);
          obs.complete();
        }
      }
    });
  }

  save() {
    // the actuals tab might have to get more info from the user, so
    // this function doesn't return immediately.
    var obs = this.monthlies().subscribe(data => {
      if (this.isadmin) {
        this.oandesvc.createAdminMonthlyInput(this.exeline.id, data).subscribe(d2 => {
          if (d2.error) {
            Notify.error(d2.error);
          }
          else {
            Notify.success('Data saved');
            this.parent.refresh(this.exeline.id);
          }
        });
      }
      else {
        this.oandesvc.createMonthlyInput(this.exeline.id, data[0]).subscribe(data => {
          if (data.error) {
            Notify.error(data.error);
          }
          else {
            Notify.success('Data saved');
            this.parent.refresh(this.exeline.id);
          }
        });
      }
    });
  }
}

interface ActualsRow {
  label: string,
  // all these arrays should have as many indicies as there are execution months
  toa: number[],
  released: number[],
  oblgoal_pct: number[],
  expgoal_pct: number[],
  values: number[]
}
