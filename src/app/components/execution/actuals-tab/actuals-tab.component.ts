import { Component, OnInit, ViewChild, Input } from '@angular/core'

// Other Components
import { GridOptions } from 'ag-grid';
import { AgGridNg2 } from 'ag-grid-angular';
import { OandEMonthly, ExecutionLine, Execution } from '../../../generated';
import { ActualsCellRendererComponent } from '../actuals-cell-renderer/actuals-cell-renderer.component';

@Component({
  selector: 'actuals-tab',
  templateUrl: './actuals-tab.component.html',
  styleUrls: ['./actuals-tab.component.scss']
})

export class ActualsTabComponent implements OnInit {

  @ViewChild("agGrid") private agGrid: AgGridNg2;

  private firstMonth = 0;
  @Input() private oandes: OandEMonthly[];
  @Input() private exeline: ExecutionLine;
  private _exe: Execution;
  private agOptions: GridOptions;
  private editMonth: number = -1;
  private isadmin: boolean = false;

  @Input() set exe(e: Execution) {
    this._exe = e;
    this.firstMonth = 0;
    if (this.agOptions.api) {
      this.agOptions.api.refreshHeader();
    }

    var date = new Date();
    var day = date.getDay();
    var month = date.getMonth();

    month = 9; // testing: October
    day = 7; // testing

    // after the 14th, we're on to the next month
    if (day >= 15) {
      month += 1;
    }

    if (month - 9 < 0) {
      month += 3;
    } else {
      month -= 9;
    }

    this.editMonth = month;
    console.log(' edit month is: ' + this.editMonth);
  }

  get exe(): Execution {
    return this._exe;
  }

  constructor() {
    var my: ActualsTabComponent = this;

    var rows = [
      {
        actuals: 'TOA',
        cellClass: ['font-weight-bold']
      },
      {
        actuals: 'Released',
        cellClass: ['font-weight-bold']
      },
      {
        actuals: 'Committed (Monthly)'
      },
      {
        actuals: 'Cumulative Committed',
        cellClass: ['font-weight-bold', 'text-right']
      },
      {
        actuals: 'Obligated (Monthly)'
      },
      {
        actuals: 'Cumulative Obligated',
        cellClass: ['font-weight-bold', 'text-right']
      },
      {
        actuals: 'OSD Goal',
        cellClass: ['font-weight-bold', 'text-right']
      },
      {
        actuals: 'Delta',
        cellClass: ['font-weight-bold', 'text-right']
      },
      {
        actuals: 'Outlayed (Monthly)'
      },
      {
        actuals: 'Cumulative Outlayed',
        cellClass: ['font-weight-bold', 'text-right']
      },
      {
        actuals: 'OSD Goal',
        cellClass: ['font-weight-bold', 'text-right']
      },
      {
        actuals: 'Delta',
        cellClass: ['font-weight-bold', 'text-right']
      },
      {
        actuals: 'Actuals (Monthly)'
      },
      {
        actuals: 'Cumulative Actuals',
        cellClass: ['font-weight-bold', 'text-right']
      }, 
    ];

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

    var valueGetter = function (params) {
      if (!my.oandes) {
        return '';
      }
      // first, figure out which column we're in so we know which month to get
      // then, figure out which row we're in so we can calculate the amount

      // col will be from 0-11, representing the months of the FY
      var col: number = Number.parseInt(params.column.colId) - 1;

      var oande: OandEMonthly;
      my.oandes.filter(oe => (oe.month === (col + my.firstMonth))).forEach(oe => {
        // at most one of these
        oande = oe;
      });

      if (oande) {

      }
      else {
        // no monthly value yet
        return '';
      }

      var row: number = params.rowIndex;

      return row + '-' + col;
    };

    var valueSetter = function (params) {
      if (!my.oandes) {
        return;
      }

      // col will be from 0-11, representing the months of the FY
      var col: number = Number.parseInt(params.column.colId) - 1;
      var row: number = params.rowIndex;


      if (my.oandes.length < col) {

      } else {
        my.oandes.push({});
      }
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
      rowData: rows,
      frameworkComponents: agcomps,
      context: {
        exe: my.exe,
        exeline: my.exeline,
        oandes: my.oandes
      },
      columnDefs: [
        {
          headerValueGetter: getHeaderValue,
          children: [
            {
              headerName: 'Actuals',
              field: 'actuals',
              filter: 'agTextColumnFilter',
              cellClass: ['ag-cell-white'],
              maxWidth: 250,
              cellClassRules: {
                'text-right': params => cssright.has(params.node.rowIndex),
                'bold': params => cssbold.has(params.node.rowIndex)
              }
            },
            {
              headerName: 'Oct',
              colId: 0,
              valueGetter: valueGetter,
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
              valueGetter: valueGetter,
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
              valueGetter: valueGetter,
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
              valueGetter: valueGetter,
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
              valueGetter: valueGetter,
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
              valueGetter: valueGetter,
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
              valueGetter: valueGetter,
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
              valueGetter: valueGetter,
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
              valueGetter: valueGetter,
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
              valueGetter: valueGetter,
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
              valueGetter: valueGetter,
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
              valueGetter: valueGetter,
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
