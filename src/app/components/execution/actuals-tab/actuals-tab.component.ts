import { Component, OnInit, ViewChild, Input } from '@angular/core'

// Other Components
import { GridOptions } from 'ag-grid';
import { AgGridNg2 } from 'ag-grid-angular';
import { OandEMonthly, ExecutionLine, Execution, SpendPlan } from '../../../generated';
import { ActualsCellRendererComponent } from '../actuals-cell-renderer/actuals-cell-renderer.component';

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
  private agOptions: GridOptions;
  private rows: any[];
  firstMonth = 0;
  editMonth: number = -1;
  isadmin: boolean = false;

  @Input() set exeline(e: ExecutionLine) {
    //console.log('setting exeline')
    this._exeline = e;
    this.refreshTableData();
  }

  get exeline() : ExecutionLine {
    return this._exeline;
  }

  @Input() set exe(e: Execution) {
    //console.log('setting exe');
    this._exe = e;
    this.firstMonth = 0;
    if (this.agOptions.api) {
      this.agOptions.api.refreshHeader();
    }

    var date = new Date();
    var day = date.getDay();
    var month = date.getMonth();

    // set a few values for testing
    month = 3;
    day = 7;

    // after the 14th, we're on to the next month
    if (day >= 15) {
      month += 1;
    }

    if (month - 9 < 0) {
      month += 3;
    } else {
      month -= 9;
    }

    this.editMonth = this.firstMonth + month;
    //console.log(' edit month is: ' + this.editMonth);
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

  constructor() {
    var my: ActualsTabComponent = this;

    var editrows: Set<number> = new Set<number>([2, 4, 8, 12]);

    var editsok = function (params) {
      var colOk: boolean = (my.isadmin
        ? true
        : (my.firstMonth + params.colDef.colId) === my.editMonth);
      var rowOk: boolean = editrows.has(params.node.rowIndex);

      //console.log(params)
      //console.log(my.firstMonth + params.colDef.colId);
      //console.log('editsok: ' + colOk + ' ' + rowOk);

      return (rowOk && colOk);
    }

    var valueSetter = function (params) {
      // col is the index of the values array of the data (e.g., 0-36 for a 3-year cycle)
      var col: number = Number.parseInt(params.colDef.colId) + my.firstMonth;
      var row: number = params.node.childIndex;

      var oldval: number = Number.parseFloat(params.oldValue);
      var newval: number = Number.parseFloat(params.newValue);
      my.rows[row].values[col] = newval;

      for (var i = col; col < my.rows.values.length; i++) {
        my.rows[row + 1].values[i] = my.rows[row + 1].values[i] - oldval + newval;
      }

      my.recalculateTableData();
      return true;
    }

    var getHeaderValue = function (params) {
      return (my.exe ? 'FY' + my.exe.fy : 'First Year')
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
                'font-weight-bold': params => cssbold.has(params.node.rowIndex)
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
              cellClassRules : {
                'ag-cell-editable': p => (
                  (my.firstMonth + p.colDef.colId) === my.editMonth &&
                  editrows.has(p.rowIndex)
                ),
                'ag-cell-light-green': p => (!((my.firstMonth + p.colDef.colId) === my.editMonth &&
                  editrows.has(p.rowIndex)))
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
                'ag-cell-editable': p => (
                  (my.firstMonth + p.colDef.colId) === my.editMonth &&
                  editrows.has(p.rowIndex)
                ),
                'ag-cell-light-green': p => (!((my.firstMonth + p.colDef.colId) === my.editMonth &&
                  editrows.has(p.rowIndex)))
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
                'ag-cell-editable': p => (
                  (my.firstMonth + p.colDef.colId) === my.editMonth &&
                  editrows.has(p.rowIndex)
                ),
                'ag-cell-light-green': p => (!((my.firstMonth + p.colDef.colId) === my.editMonth &&
                  editrows.has(p.rowIndex)))
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
                'ag-cell-editable': p => (
                  (my.firstMonth + p.colDef.colId) === my.editMonth &&
                  editrows.has(p.rowIndex)
                ),
                'ag-cell-light-green': p => (!((my.firstMonth + p.colDef.colId) === my.editMonth &&
                  editrows.has(p.rowIndex)))
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
                'ag-cell-editable': p => (
                  (my.firstMonth + p.colDef.colId) === my.editMonth &&
                  editrows.has(p.rowIndex)
                ),
                'ag-cell-light-green': p => (!((my.firstMonth + p.colDef.colId) === my.editMonth &&
                  editrows.has(p.rowIndex)))
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
                'ag-cell-editable': p => (
                  (my.firstMonth + p.colDef.colId) === my.editMonth &&
                  editrows.has(p.rowIndex)
                ),
                'ag-cell-light-green': p => (!((my.firstMonth + p.colDef.colId) === my.editMonth &&
                  editrows.has(p.rowIndex)))
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
                'ag-cell-editable': p => (
                  (my.firstMonth + p.colDef.colId) === my.editMonth &&
                  editrows.has(p.rowIndex)
                ),
                'ag-cell-light-green': p => (!((my.firstMonth + p.colDef.colId) === my.editMonth &&
                  editrows.has(p.rowIndex)))
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
                'ag-cell-editable': p => (
                  (my.firstMonth + p.colDef.colId) === my.editMonth &&
                  editrows.has(p.rowIndex)
                ),
                'ag-cell-light-green': p => (!((my.firstMonth + p.colDef.colId) === my.editMonth &&
                  editrows.has(p.rowIndex)))
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
                'ag-cell-editable': p => (
                  (my.firstMonth + p.colDef.colId) === my.editMonth &&
                  editrows.has(p.rowIndex)
                ),
                'ag-cell-light-green': p => (!((my.firstMonth + p.colDef.colId) === my.editMonth &&
                  editrows.has(p.rowIndex)))
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
                'ag-cell-editable': p => (
                  (my.firstMonth + p.colDef.colId) === my.editMonth &&
                  editrows.has(p.rowIndex)
                ),
                'ag-cell-light-green': p => (!((my.firstMonth + p.colDef.colId) === my.editMonth &&
                  editrows.has(p.rowIndex)))
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
                'ag-cell-editable': p => (
                  (my.firstMonth + p.colDef.colId) === my.editMonth &&
                  editrows.has(p.rowIndex)
                ),
                'ag-cell-light-green': p => (!((my.firstMonth + p.colDef.colId) === my.editMonth &&
                  editrows.has(p.rowIndex)))
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
                'ag-cell-editable': p => (
                  (my.firstMonth + p.colDef.colId) === my.editMonth &&
                  editrows.has(p.rowIndex)
                ),
                'ag-cell-light-green': p => (!((my.firstMonth + p.colDef.colId) === my.editMonth &&
                  editrows.has(p.rowIndex)))
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
      { label: 'TOA', values: [] },
      { label: 'Released', values: [] },
      { label: 'Committed (Monthly)', values: [] },
      { label: 'Cumulative Committed', values: [] },
      { label: 'Obligated (Monthly)', values: [] },
      { label: 'Cumulative Obligated', values: [] },
      { label: 'OSD Goal', values: [] },
      { label: 'Delta', values: [] },
      { label: 'Outlayed (Monthly)', values: [] },
      { label: 'Cumulative Outlayed', values: [] },
      { label: 'OSD Goal', values: [] },
      { label: 'Delta', values: [] },
      { label: 'Accruals (Monthly)', values: [] },
      { label: 'Cumulative Actuals', values: [] },
    ];

    if (this._exeline && this._exe && this._oandes) {
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

      for (var i = 0; i < max; i++) {
        this.rows[0].values.push(this.exeline.toa);
        this.rows[1].values.push(this.exeline.released);       
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
  }

  recalculateTableData() {
    // get our goals information
    var progtype: string = this.exeline.appropriation;
    var ogoals: SpendPlan = this.exe.osdObligationGoals[progtype];
    var egoals: SpendPlan = this.exe.osdExpenditureGoals[progtype];

    var committed: number = 0;
    var obligated: number = 0;
    var outlayed: number = 0;
    var accruals: number = 0;

    for (var i = 0; i < this.rows[0].values.length; i++) {
      committed += this.rows[2].values[i];
      this.rows[3].values[i] = committed;

      obligated += this.rows[4].values[i];
      this.rows[5].values[i] = obligated;

      if (i < ogoals.monthlies.length) {
        this.rows[6].values[i] = this.exeline.toa * ogoals.monthlies[i];
        this.rows[7].values[i] = this.rows[6].values[i] - obligated;
      }

      outlayed += this.rows[8].values[i];
      this.rows[9].values[i] = outlayed;

      if (i < egoals.monthlies.length) {
        this.rows[10].values[i] = this.exeline.toa * egoals.monthlies[i];
        this.rows[11].values[i] = this.rows[10].values[i] - outlayed;
      }

      accruals += this.rows[12].values[i];
      this.rows[13].values[i] = accruals;
    }

    console.log(this.rows);

    if(this.agOptions.api) {
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
    //console.log('value getter for (' + row + ',' + col + '); index is: ' + index + '; vlen:' + params.data.values.length);
    if (params.data.values.length >= index) {
      //console.log(params.data.values);
      //console.log('  returning ' + params.data.values[index]);
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
    window.addEventListener("resize", function() {
      setTimeout(() => {
        params.api.sizeColumnsToFit();
      });
    });
  }
}

interface ActualsRow {
  label: string,
  values: number[] // should have as many indicies as there are execution months
}