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

      return (0 === row ? '' : my.rowData[row].values[col]);
    }

    var setter = function (p) {
      var row: number = p.node.rowIndex;
      var col: number = my.firstMonth + Number.parseInt(p.colDef.colId);
      my.rowData[row].values[col] = Number.parseFloat(p.newValue);
      p.node.data.values[col] = Number.parseFloat(p.newValue);
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
            editable: true,
            cellEditor: 'agRichSelectCellEditor',
            cellEditorParams: {
              values:['Baseline','After Appropriation']
            },
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
            editable: p => (p.node.rowIndex > 0),
            valueGetter: getter,
            valueSetter: setter,
            cellClass: ['ag-cell-white', 'text-right']
          },
          {
            headerName: 'Nov',
            colId: 1,
            valueGetter: getter,
            valueSetter: setter,
            editable: p => (p.node.rowIndex > 0),
            cellClass: ['ag-cell-white', 'text-right']
          },
          {
            headerName: 'Dec',
            colId: 2,
            valueGetter: getter,
            editable: p => (p.node.rowIndex > 0),
            valueSetter: setter,
            cellClass: ['ag-cell-white', 'text-right']
          },
          {
            headerName: 'Jan',
            colId: 3,
            valueGetter: getter,
            editable: p => (p.node.rowIndex > 0),
            valueSetter: setter,
            cellClass: ['ag-cell-white', 'text-right']
          },
          {
            headerName: 'Feb',
            colId: 4,
            valueGetter: getter,
            editable: p => (p.node.rowIndex > 0),
            valueSetter: setter,
            cellClass: ['ag-cell-white', 'text-right']
          },
          {
            headerName: 'Mar',
            colId: 5,
            valueGetter: getter,
            editable: p => (p.node.rowIndex > 0),
            valueSetter: setter,
            cellClass: ['ag-cell-white', 'text-right']
          },
          {
            headerName: 'Apr',
            colId: 6,
            valueGetter: getter,
            valueSetter: setter,
            editable: p => (p.node.rowIndex > 0),
            cellClass: ['ag-cell-white', 'text-right']
          },
          {
            headerName: 'May',
            colId: 7,
            valueGetter: getter,
            editable: p => (p.node.rowIndex > 0),
            valueSetter: setter,
            cellClass: ['ag-cell-white', 'text-right']
          },
          {
            headerName: 'Jun',
            colId: 8,
            valueGetter: getter,
            editable: p => (p.node.rowIndex > 0),
            valueSetter: setter,
            cellClass: ['ag-cell-white', 'text-right']
          },
          {
            headerName: 'Jul',
            colId: 9,
            valueGetter: getter,
            editable: p => (p.node.rowIndex > 0),
            valueSetter: setter,
            cellClass: ['ag-cell-white', 'text-right']
          },
          {
            headerName: 'Aug',
            colId: 10,
            valueGetter: getter,
            editable: p => (p.node.rowIndex > 0),
            valueSetter: setter,
            cellClass: ['ag-cell-white', 'text-right']
          },
          {
            headerName: 'Sep',
            colId: 11,
            valueGetter: getter,
            editable: p => (p.node.rowIndex > 0),
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
    if (this._exe && this._exeline && this._oandes && this._deltas) {

      var tmpdata: DataRow[] = [
        { label: 'Baseline', values: [] },
        { label: 'Obligated', values: [] },
        { label: 'Civilian Labor', values: [] },
        { label: 'Travel', values: [] },
        { label: 'Contracts', values: [] },
        { label: 'Other', values: [] },
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
        total: this.rowData[1].values[i],
        labor: this.rowData[2].values[i],
        travel: this.rowData[3].values[i],
        contracts: this.rowData[4].values[i],
        other: this.rowData[5].values[i]
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
}

interface DataRow {
  label: string,
  values: number[];
}
