import { Component, OnInit, ViewChild, Input } from '@angular/core'

// Other Components
import { HeaderComponent } from '../../header/header.component'
import { GridOptions } from 'ag-grid';
import { AgGridNg2 } from 'ag-grid-angular';
import { OandEMonthly, ExecutionLine, Execution, ExecutionEvent, OSDGoalPlan, SpendPlanService, SpendPlan } from '../../../generated';
import { AddSpendPlanComponent } from '../add-spend-plan/add-spend-plan.component';
import { Notify } from '../../../utils/Notify';
import { SpendPlanMonthly } from '../../../generated';
import { OandETools, ToaAndReleased } from '../model/oande-tools';
import { FyHeaderComponent } from '../fy-header/fy-header.component';

@Component({
  selector: 'spend-plans-tab',
  templateUrl: './spend-plans-tab.component.html',
  styleUrls: ['./spend-plans-tab.component.scss']
})

//////////////////////////////////////////////////////////////
// WARNING: This class relies HEAVILY on the order of rows. //
//          Do not change the order willy-nilly             //
//////////////////////////////////////////////////////////////
export class SpendPlansTabComponent implements OnInit {
  @ViewChild(HeaderComponent) header;
  @ViewChild("agGrid") private agGrid: AgGridNg2;
  @ViewChild(AddSpendPlanComponent) private addarea;
  @Input() parent: any;

  private agOptions: GridOptions;

  private firstMonth: number = 0;
  private _oandes: OandEMonthly[];
  private _exeline: ExecutionLine;
  private _exe: Execution;
  private _deltas: Map<Date, ExecutionEvent>;
  private rowData: PlanRow[];
  private plans: SpendPlan[];
  private plan: SpendPlan;
  private maxmonths: number;
  private showPercentages: boolean = true;

  @Input() set exeline(e: ExecutionLine) {
    if (e) {
      this._exeline = e;
      this.plansvc.getByExecutionLineId(e.id).subscribe(d => {
        if (d.error) {
          delete this.plan;
          Notify.error(d.error);
        }
        else {
          this.plans = d.result;
          if (this.plans.length > 0) {
            this.plan = this.plans[0];
          }
        }
        this.refreshTableData();
      });
    }
  }

  get exeline(): ExecutionLine {
    return this._exeline;
  }

  @Input() set exe(e: Execution) {
    //console.log('setting exe');
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

  constructor(private plansvc: SpendPlanService) {
    var my: SpendPlansTabComponent = this;
    var getHeaderValue1 = function (p) {
      return (my._exeline ? my.exeline.appropriation : '');
    }

    var getter = function (p) {
      var row: number = p.node.rowIndex;
      var col: number = my.firstMonth + Number.parseInt(p.colDef.colId);
      if (0 === row || 7 === row || 10 === row) {
        return '';
      }
      return p.node.data.values[col];
    }

    var setPlan = function (p) {
      my.plan = p.newValue;
      my.refreshTableData();
      return true;
    }

    var formatter = function (p) {
      if ('' === p.value) {
        return '';
      }
      if (my.showPercentages) {
        var col: number = my.firstMonth + Number.parseInt(p.colDef.colId);
        var toa: number = p.data.toas[col];
        return ( 100 * p.value / toa).toFixed(2);
      }
      else {
        return p.value.toFixed(2);
      }
    }

    var cssbold: Set<number> = new Set<number>([0, 1, 3, 5, 6, 7, 9, 10, 11, 13]);
    var cssright: Set<number> = new Set<number>([3, 5, 6, 7, 9, 10, 11, 13]);
    var csscenter: Set<number> = new Set<number>([1, 8]);

    this.agOptions = <GridOptions>{
      enableColResize: true,
      enableSorting: false,
      enableFilter: false,
      gridAutoHeight: true,
      pagination: true,
      paginationPageSize: 30,
      suppressPaginationPanel: true,
      toolPanelSuppressSideButtons: true,
      frameworkComponents: { fyheader: FyHeaderComponent },
      suppressDragLeaveHidesColumns: true,
      suppressMovableColumns: true,
      columnDefs: [{
        headerValueGetter: getHeaderValue1,
        headerName: 'RDTE',
        field: 'rdte',
        cellClass: ['ag-cell-white'],
        maxWidth: 220,
        children: [
          {
            headerName: 'Spend Plans',
            editable: p => (0 === p.node.rowIndex && my.plans && my.plans.length > 1),
            field: 'label',
            cellEditor: 'agRichSelectCellEditor',
            cellEditorParams: function (p) {
              return {
                values: my.plans,
                formatValue: p => (p && p.type
                  ? (SpendPlan.TypeEnum.BASELINE === p.type ? 'Baseline' : 'After Appropriation')
                  : p)
              };
            },
            valueSetter: setPlan,
            maxWidth: 220,
            cellClass: ['ag-cell-white'],
            cellClassRules: {
              'text-right': params => cssright.has(params.node.rowIndex),
              'text-center': params => csscenter.has(params.node.rowIndex),
              'font-weight-bold': params => cssbold.has(params.node.rowIndex)
            }
          }
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
            width: 82,
            valueGetter: getter,
            valueFormatter: formatter,
            cellClass: ['ag-cell-white', 'text-right']
          },
          {
            headerName: 'Nov',
            colId: 1,
            width: 82,
            valueGetter: getter,
            valueFormatter:formatter,
            cellClass: ['ag-cell-white', 'text-right']
          },
          {
            headerName: 'Dec',
            colId: 2,
            width: 82,
            valueGetter: getter,
            valueFormatter:formatter,
            cellClass: ['ag-cell-white', 'text-right']
          },
          {
            headerName: 'Jan',
            colId: 3,
            width: 82,
            valueGetter: getter,
            valueFormatter:formatter,
            cellClass: ['ag-cell-white', 'text-right']
          },
          {
            headerName: 'Feb',
            colId: 4,
            width: 82,
            valueGetter: getter,
            valueFormatter:formatter,
            cellClass: ['ag-cell-white', 'text-right']
          },
          {
            headerName: 'Mar',
            colId: 5,
            width: 82,
            valueGetter: getter,
            valueFormatter:formatter,
            cellClass: ['ag-cell-white', 'text-right']
          },
          {
            headerName: 'Apr',
            colId: 6,
            width: 80,
            valueGetter: getter,
            valueFormatter:formatter,
            cellClass: ['ag-cell-white', 'text-right']
          },
          {
            headerName: 'May',
            colId: 7,
            width: 82,
            valueGetter: getter,
            valueFormatter:formatter,
            cellClass: ['ag-cell-white', 'text-right']
          },
          {
            headerName: 'Jun',
            colId: 8,
            width: 82,
            valueGetter: getter,
            valueFormatter:formatter,
            cellClass: ['ag-cell-white', 'text-right']
          },
          {
            headerName: 'Jul',
            colId: 9,
            width: 82,
            valueGetter: getter,
            valueFormatter:formatter,
            cellClass: ['ag-cell-white', 'text-right']
          },
          {
            headerName: 'Aug',
            colId: 10,
            width: 82,
            valueGetter: getter,
            valueFormatter:formatter,
            cellClass: ['ag-cell-white', 'text-right']
          },
          {
            headerName: 'Sep',
            colId: 11,
            width: 82,
            valueGetter: getter,
            valueFormatter:formatter,
            cellClass: ['ag-cell-white', 'text-right']
          }
        ]
      }
      ]
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
      if (!this.plan) {
        this.rowData = [];
        return;
      }

      var tmpdata: PlanRow[] = [
        { label: (SpendPlan.TypeEnum.BASELINE === this.plan.type ? 'Baseline' : 'After Appropriation'), values: [], toas:[] },
        { label: 'Obligated', values: [], toas: [] },
        { label: 'Civilian Labor', values: [], toas: [] },
        { label: 'Travel', values: [], toas: [] },
        { label: 'Contracts', values: [], toas: [] },
        { label: 'Other', values: [], toas: [] },
        { label: 'Expensed', values: [], toas: [] },
        { label: 'OSD', values: [], toas: [] },
        { label: 'Obligated', values: [], toas: [] },
        { label: 'Expensed', values: [], toas: [] },
        { label: 'DELTA', values: [], toas: [] },
        { label: 'Obligated', values: [], toas: [] },
        { label: 'Expensed', values: [], toas: [] },
      ];

      var progtype: string = this.exeline.appropriation;
      var ogoals: OSDGoalPlan = this.exe.osdObligationGoals[progtype];
      var egoals: OSDGoalPlan = this.exe.osdExpenditureGoals[progtype];
      this.maxmonths = Math.max(ogoals.monthlies.length, egoals.monthlies.length);

      var toas: ToaAndReleased[] = OandETools.calculateToasAndReleaseds(this.exeline,
        this.deltas, this.maxmonths, this.exe.fy);

      for (var i = 0; i < this.maxmonths; i++) {
        var monthly: SpendPlanMonthly = (i < this.plan.monthlies.length
          ? this.plan.monthlies[i]
          : { obligated: 0, labor: 0, travel: 0, contracts: 0, expensed: 0, other: 0 });

        tmpdata[1].values.push(monthly.obligated);
        tmpdata[2].values.push(monthly.labor);
        tmpdata[3].values.push(monthly.travel);
        tmpdata[4].values.push(monthly.contracts);
        tmpdata[5].values.push(monthly.other);
        tmpdata[6].values.push(monthly.expensed);

        // OSD section
        tmpdata[7].values.push(0);
        tmpdata[8].values.push(toas[i].toa * (ogoals.monthlies.length > i ? ogoals.monthlies[i] : 1.0));
        tmpdata[9].values.push(toas[i].toa * (egoals.monthlies.length > i ? egoals.monthlies[i] : 1.0));

        // Delta section
        tmpdata[10].values.push(0);
        tmpdata[11].values.push(tmpdata[8].values[i] - tmpdata[1].values[i]);
        tmpdata[12].values.push(tmpdata[9].values[i] - tmpdata[6].values[i]);

        tmpdata.forEach(row => {
          row.toas.push(toas[i].toa);
        });
      }

      this.rowData = tmpdata;

      this.agOptions.api.refreshHeader();
    }
  }

  onTogglePct() {
    this.showPercentages = !this.showPercentages;
    this.agOptions.api.redrawRows();
  }

  addplan() {
    var newplan = this.addarea.getSpendPlan();
    console.log(newplan);
    this.plansvc.createSpendPlan(this.exeline.id, newplan).subscribe(d => {
      if (d.error) {
        Notify.error(d.error);
      }
      else {
        this.plans.push(d.result);
        if (!this.plan) {
          this.plan = this.plans[0];
        }
        this.refreshTableData();
      }
    });
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

interface PlanRow {
  label: string,
  toas: number[],
  values: number[];
}
