import { Component, OnInit, ViewChild, Input } from '@angular/core'

// Other Components
import { GridOptions } from 'ag-grid';
import { AgGridNg2 } from 'ag-grid-angular';
import { OandEMonthly, ExecutionLine, Execution, SpendPlan, ExecutionEvent, ExecutionEventData } from '../../../generated';
import { ActualsCellRendererComponent } from '../actuals-cell-renderer/actuals-cell-renderer.component';
import { OandETools, ToaAndReleased } from '../model/oande-tools';

import { Observable } from 'rxjs';
import { Subject } from 'rxjs/Subject';

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

  constructor() {
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

    var isyellow = function (params): boolean {
      if (7 == params.rowIndex || 11 == params.rowIndex) {
        var fymonth: number = my.firstMonth + params.colDef.colId;
        if (my.isadmin || fymonth <= my.editMonth) {
          var pct = params.value / params.data.toa[fymonth];
          return (pct >= 0.1 && pct < 0.15);
        }
      }
      return false;
    }
    var isred = function (params): boolean {
      if (7 == params.rowIndex || 11 == params.rowIndex) {
        var fymonth: number = my.firstMonth + params.colDef.colId;
        if (my.isadmin || fymonth <= my.editMonth) {
          var pct = params.value / params.data.toa[fymonth];
          return pct >= 0.15;
        }
      }
      return false;
    }
    var isgreen = function (params): boolean {
      if (7 == params.rowIndex || 11 == params.rowIndex) {
        var fymonth: number = my.firstMonth + params.colDef.colId;
        if (my.isadmin || fymonth <= my.editMonth) {
          var pct = params.value / params.data.toa[fymonth];
          return pct < 0.1;
        }
      }
      return false;
    }

    var getHeaderValue = function (params) {
      var inty: number = my.firstMonth / 12;
      return (my.exe ? 'FY' + (my.exe.fy + inty) : 'First Year');
    }

    var agcomps: any = {
      actualsRenderer: ActualsCellRendererComponent
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
          headerValueGetter: getHeaderValue,
          children: [
            {
              headerName: 'Actuals',
              field: 'label',
              filter: 'agTextColumnFilter',
              cellClass: ['ag-cell-white'],
              maxWidth: 250,
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
              maxWidth: 88,
              cellClassRules: {
                'ag-cell-editable': editsok,
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
              valueSetter: valueSetter,
              valueGetter: params => my.valueGetter(params),
              cellRenderer: 'actualsRenderer',
              maxWidth: 88,
              cellClassRules: {
                'ag-cell-editable': editsok,
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
              type: 'numericColumn',
              valueSetter: valueSetter,
              cellRenderer: 'actualsRenderer',
              maxWidth: 88,
              cellClassRules: {
                'ag-cell-editable': editsok,
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
              valueGetter: params => my.valueGetter(params),
              cellRenderer: 'actualsRenderer',
              type: 'numericColumn',
              maxWidth: 88,
              cellClassRules: {
                'ag-cell-editable': editsok,
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
              valueGetter: params => my.valueGetter(params),
              cellRenderer: 'actualsRenderer',
              maxWidth: 88,
              type: 'numericColumn',
              cellClassRules: {
                'ag-cell-editable': editsok,
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
              valueSetter: valueSetter,
              cellRenderer: 'actualsRenderer',
              valueGetter: params => my.valueGetter(params),
              type: 'numericColumn',
              maxWidth: 80,
              cellClassRules: {
                'ag-cell-editable': editsok,
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
              type: 'numericColumn',
              valueGetter: params => my.valueGetter(params),
              maxWidth: 88,
              cellClassRules: {
                'ag-cell-editable': editsok,
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
              valueGetter: params => my.valueGetter(params),
              valueSetter: valueSetter,
              cellRenderer: 'actualsRenderer',
              type: 'numericColumn',
              maxWidth: 88,
              cellClassRules: {
                'ag-cell-editable': editsok,
                'ag-cell-light-green': p => (!editsok(p)),
                'ag-cell-yellow': isyellow,
                'ag-cell-red': isred,
                'ag-cell-dark-green': isgreen
              }
            },
            {
              headerName: 'Jun',
              colId: 8,
              editable: editsok,
              valueGetter: params => my.valueGetter(params),
              type: 'numericColumn',
              valueSetter: valueSetter,
              cellRenderer: 'actualsRenderer',
              maxWidth: 88,
              cellClassRules: {
                'ag-cell-editable': editsok,
                'ag-cell-light-green': p => (!editsok(p)),
                'ag-cell-yellow': isyellow,
                'ag-cell-red': isred,
                'ag-cell-dark-green': isgreen
              }
            },
            {
              headerName: 'Jul',
              colId: 9,
              editable: editsok,
              valueGetter: params => my.valueGetter(params),
              cellRenderer: 'actualsRenderer',
              valueSetter: valueSetter,
              maxWidth: 80,
              type: 'numericColumn',
              cellClassRules: {
                'ag-cell-editable': editsok,
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
              cellRenderer: 'actualsRenderer',
              maxWidth: 88,
              type: 'numericColumn',
              valueSetter: valueSetter,
              cellClassRules: {
                'ag-cell-editable': editsok,
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
              maxWidth: 88,
              valueSetter: valueSetter,
              type: 'numericColumn',
              cellClassRules: {
                'ag-cell-editable': editsok,
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
      { label: 'OSD Goal', values: [], toa: [], released: [], oblgoal_pct: [], expgoal_pct: [] },
      { label: 'Delta', values: [], toa: [], released: [], oblgoal_pct: [], expgoal_pct: [] },
      { label: 'Outlayed (Monthly)', values: [], toa: [], released: [], oblgoal_pct: [], expgoal_pct: [] },
      { label: 'Cumulative Outlayed', values: [], toa: [], released: [], oblgoal_pct: [], expgoal_pct: [] },
      { label: 'OSD Goal', values: [], toa: [], released: [], oblgoal_pct: [], expgoal_pct: [] },
      { label: 'Delta', values: [], toa: [], released: [], oblgoal_pct: [], expgoal_pct: [] },
      { label: 'Accruals (Monthly)', values: [], toa: [], released: [], oblgoal_pct: [], expgoal_pct: [] },
      { label: 'Cumulative Actuals', values: [], toa: [], released: [], oblgoal_pct: [], expgoal_pct: [] },
    ];

    if (this._exeline && this._exe && this._oandes && this._deltas) {
      // get our goals information
      var progtype: string = this.exeline.appropriation;
      var ogoals: SpendPlan = this.exe.osdObligationGoals[progtype];
      var egoals: SpendPlan = this.exe.osdExpenditureGoals[progtype];

      var max = Math.max(ogoals.monthlies.length, egoals.monthlies.length);
      // get our O&E values in order of month, so we can
      // run right through them
      var myoandes: OandEMonthly[] = new Array(max);
      this.oandes.forEach(oande => {
        myoandes[oande.month] = oande;
      });

      this.rows.forEach(ar => {
        for (var i = 0; i < max; i++) {
          ar.toa.push(0);
          ar.released.push(0);

          ar.expgoal_pct.push(egoals.monthlies.length > i ? egoals.monthlies[i] : 1);
          ar.oblgoal_pct.push(ogoals.monthlies.length > i ? ogoals.monthlies[i] : 1);
        }
      });

      for (var i = 0; i < max; i++) {
        this.rows[0].values.push(0);
        this.rows[1].values.push(0);
        
        this.rows[2].values.push(myoandes[i] ? myoandes[i].committed : 0);
        this.rows[3].values.push(0);

        this.rows[4].values.push(myoandes[i] ? myoandes[i].obligated : 0);

        this.rows[5].values.push(0);
        this.rows[6].values.push(0);
        this.rows[7].values.push(0);

        this.rows[8].values.push(myoandes[i] ? myoandes[i].outlayed : 0);

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
    console.log('recalculating table data');
    // get our goals information
    var progtype: string = this.exeline.appropriation;
    var ogoals: SpendPlan = this.exe.osdObligationGoals[progtype];
    var egoals: SpendPlan = this.exe.osdExpenditureGoals[progtype];

    var committed: number = 0;
    var obligated: number = 0;
    var outlayed: number = 0;
    var accruals: number = 0;

    // go through all our deltas and calculate toas and released
    var toasAndReleaseds: ToaAndReleased[]
      = OandETools.calculateToasAndReleaseds(this.exeline, this._deltas,
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

      outlayed += this.rows[8].values[i];
      this.rows[9].values[i] = outlayed;

      if (i < egoals.monthlies.length) {
        this.rows[10].values[i] = toa * egoals.monthlies[i];
        this.rows[11].values[i] = this.rows[10].values[i] - outlayed;
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

  onTogglePct() {
    this.showPercentages = !this.showPercentages;
    this.agOptions.api.redrawRows();
  }

  onToggleAdmin() {
    this.isadmin = !this.isadmin;
    this.agOptions.api.redrawRows();
  }

  prevFy() {
    if (this.firstMonth - 12 >= 0) {
      this.firstMonth -= 12;
      this.agOptions.api.refreshHeader();
      this.agOptions.api.redrawRows();
    }

    this.enableNextPrevButtons();
  }

  nextFy() {
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
    var subject: Subject<OandEMonthly[]> = new Subject<OandEMonthly[]>();

    if (this.isadmin) {
      var data: OandEMonthly[] = [];
      for (var i = 0; i < this.rows[0].values.length; i++) {
        data.push({
          executionLineId: this.exeline.id,
          month: i,
          committed: this.rows[2].values[i],
          obligated: this.rows[4].values[i],
          outlayed: this.rows[8].values[i],
          accruals: this.rows[12].values[i]
        });
      }

      subject.next(data);
    }
    else {
      var toa: number = this.rows[5].toa[this.editMonth];

      var opct: number = (toa - this.rows[5].values[this.editMonth]) / toa;
      var epct: number = (toa - this.rows[9].values[this.editMonth]) / toa;

      var oande: OandEMonthly = {
        executionLineId: this.exeline.id,
        month: this.editMonth,
        committed: this.rows[2].values[this.editMonth],
        obligated: this.rows[4].values[this.editMonth],
        outlayed: this.rows[8].values[this.editMonth],
        accruals: this.rows[12].values[this.editMonth]
      };

      if (opct >= 0.15 || epct >= 0.15) {
        var my: ActualsTabComponent = this;
        $('#explanation-modal').on('hidden.bs.modal', function (event) {
          oande.monthsToFix = my.fixtime;
          oande.explanation = my.explanation;
          oande.remediation = my.remediation;

          subject.next([oande]);
          $('#explanation-modal').unbind('hidden.bs.modal');
        }).modal('show');
      }
    }

    return subject;
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
