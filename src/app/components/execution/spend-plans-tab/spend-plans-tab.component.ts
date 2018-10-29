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

declare const $: any;

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
  private submittable: boolean = false;
  private explanation: string;

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
      if (0 === row || 9 === row || 12  === row) {
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
        return (100 * p.value / toa).toFixed(2);
      }
      else {
        return p.value.toFixed(2);
      }
    }

    var setter = function (p) {
      var row: number = p.node.rowIndex;
      var col: number = my.firstMonth + Number.parseInt(p.colDef.colId);

      var value: number = Number.parseFloat(p.newValue);
      if (my.showPercentages) {
        value *= p.data.toas[col] / 100;
      }

      my.rowData[row].values[col] = value;
      p.node.data.values[col] = value;

      my.rowData[1].values[col] = 0;
      for (var i = 2; i < 6; i++) {
        my.rowData[1].values[col] += my.rowData[i].values[col];
      }

      // fix cumulatives and deltas
      var totalobl: number = (col > 0 ? my.rowData[7].values[col - 1] : 0);
      var totalexp: number = (col > 0 ? my.rowData[8].values[col - 1] : 0);
      for (var i = col; i < my.maxmonths; i++){
        totalobl += my.rowData[1].values[i];
        totalexp += my.rowData[6].values[i];
        my.rowData[7].values[i] = totalobl;
        my.rowData[8].values[i] = totalexp;

        my.rowData[13].values[i] = my.rowData[10].values[i] - my.rowData[7].values[i];
        my.rowData[14].values[i] = my.rowData[11].values[i] - my.rowData[8].values[i];
      }

      return true;
    }

    var editable = function (p): boolean {
      if (!my.submittable) {
        return false;
      }

      var row: number = p.node.rowIndex;
      return !(0 === row || 7 === row || 10 === row);
    }
    var cssbold: Set<number> = new Set<number>([0, 9, 12]);
    var cssright: Set<number> = new Set<number>([2, 3, 4, 5]);
    var csscenter: Set<number> = new Set<number>([1, 6, 7, 8, 10, 11, 13, 14 ]);
    var csssum: Set<number> = new Set<number>([9, 12]);
    var cssedit: Set<number> = new Set<number>([2, 3, 4, 5, 6]);
    var csswhite: Set<number> = new Set<number>([0, 1, 2, 3, 4, 5, 6, 7]);
    var csslightgreen: Set<number> = new Set<number>([10, 11]);
    var csslightorange: Set<number> = new Set<number>([13, 14]);

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
            headerName: 'Category',
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
              'font-weight-bold': params => cssbold.has(params.node.rowIndex),
              'ag-cell-footer-sum': params => csssum.has(params.node.rowIndex)
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
            valueSetter: setter,
            editable: editable,
            cellEditorParams: { useFormatter: true },
            cellClass: ['text-right'],
            cellClassRules: {
              'ag-cell-white': params => csswhite.has(params.node.rowIndex),
              'ag-cell-footer-sum': params => csssum.has(params.node.rowIndex),
              'ag-cell-light-green': params => csslightgreen.has(params.node.rowIndex),
              'ag-cell-edit': params => cssedit.has(params.node.rowIndex),
              'ag-cell-light-orange': params => csslightorange.has(params.node.rowIndex)
            }
          },
          {
            headerName: 'Nov',
            colId: 1,
            width: 82,
            valueGetter: getter,
            valueFormatter:formatter,
            valueSetter: setter,
            editable: editable,
            cellEditorParams: { useFormatter: true },
            cellClass: ['text-right'],
            cellClassRules: {
              'ag-cell-white': params => csswhite.has(params.node.rowIndex),
              'ag-cell-footer-sum': params => csssum.has(params.node.rowIndex),
              'ag-cell-light-green': params => csslightgreen.has(params.node.rowIndex),
              'ag-cell-edit': params => cssedit.has(params.node.rowIndex),
              'ag-cell-light-orange': params => csslightorange.has(params.node.rowIndex)
            }
          },
          {
            headerName: 'Dec',
            colId: 2,
            width: 82,
            valueGetter: getter,
            valueFormatter:formatter,
            valueSetter: setter,
            editable: editable,
            cellEditorParams: { useFormatter: true },
            cellClass: ['text-right'],
            cellClassRules: {
              'ag-cell-white': params => csswhite.has(params.node.rowIndex),
              'ag-cell-footer-sum': params => csssum.has(params.node.rowIndex),
              'ag-cell-light-green': params => csslightgreen.has(params.node.rowIndex),
              'ag-cell-edit': params => cssedit.has(params.node.rowIndex),
              'ag-cell-light-orange': params => csslightorange.has(params.node.rowIndex)
            }
          },
          {
            headerName: 'Jan',
            colId: 3,
            width: 82,
            valueGetter: getter,
            valueFormatter:formatter,
            valueSetter: setter,
            editable: editable,
            cellEditorParams: { useFormatter: true },
            cellClass: ['text-right'],
            cellClassRules: {
              'ag-cell-white': params => csswhite.has(params.node.rowIndex),
              'ag-cell-footer-sum': params => csssum.has(params.node.rowIndex),
              'ag-cell-light-green': params => csslightgreen.has(params.node.rowIndex),
              'ag-cell-edit': params => cssedit.has(params.node.rowIndex),
              'ag-cell-light-orange': params => csslightorange.has(params.node.rowIndex)
            }
          },
          {
            headerName: 'Feb',
            colId: 4,
            width: 82,
            valueGetter: getter,
            valueFormatter:formatter,
            valueSetter: setter,
            editable: editable,
            cellEditorParams: { useFormatter: true },
            cellClass: ['text-right'],
            cellClassRules: {
              'ag-cell-white': params => csswhite.has(params.node.rowIndex),
              'ag-cell-footer-sum': params => csssum.has(params.node.rowIndex),
              'ag-cell-light-green': params => csslightgreen.has(params.node.rowIndex),
              'ag-cell-edit': params => cssedit.has(params.node.rowIndex),
              'ag-cell-light-orange': params => csslightorange.has(params.node.rowIndex)
            }
          },
          {
            headerName: 'Mar',
            colId: 5,
            width: 82,
            valueGetter: getter,
            valueFormatter:formatter,
            valueSetter: setter,
            editable: editable,
            cellEditorParams: { useFormatter: true },
            cellClass: ['text-right'],
            cellClassRules: {
              'ag-cell-white': params => csswhite.has(params.node.rowIndex),
              'ag-cell-footer-sum': params => csssum.has(params.node.rowIndex),
              'ag-cell-light-green': params => csslightgreen.has(params.node.rowIndex),
              'ag-cell-edit': params => cssedit.has(params.node.rowIndex),
              'ag-cell-light-orange': params => csslightorange.has(params.node.rowIndex)
            }
          },
          {
            headerName: 'Apr',
            colId: 6,
            width: 80,
            valueGetter: getter,
            valueFormatter:formatter,
            valueSetter: setter,
            editable: editable,
            cellEditorParams: { useFormatter: true },
            cellClass: ['text-right'],
            cellClassRules: {
              'ag-cell-white': params => csswhite.has(params.node.rowIndex),
              'ag-cell-footer-sum': params => csssum.has(params.node.rowIndex),
              'ag-cell-light-green': params => csslightgreen.has(params.node.rowIndex),
              'ag-cell-edit': params => cssedit.has(params.node.rowIndex),
              'ag-cell-light-orange': params => csslightorange.has(params.node.rowIndex)
            }
          },
          {
            headerName: 'May',
            colId: 7,
            width: 82,
            valueGetter: getter,
            valueFormatter:formatter,
            valueSetter: setter,
            editable: editable,
            cellEditorParams: { useFormatter: true },
            cellClass: ['text-right'],
            cellClassRules: {
              'ag-cell-white': params => csswhite.has(params.node.rowIndex),
              'ag-cell-footer-sum': params => csssum.has(params.node.rowIndex),
              'ag-cell-light-green': params => csslightgreen.has(params.node.rowIndex),
              'ag-cell-edit': params => cssedit.has(params.node.rowIndex),
              'ag-cell-light-orange': params => csslightorange.has(params.node.rowIndex)
            }
          },
          {
            headerName: 'Jun',
            colId: 8,
            width: 82,
            valueGetter: getter,
            valueFormatter:formatter,
            valueSetter: setter,
            editable: editable,
            cellEditorParams: { useFormatter: true },
            cellClass: ['text-right'],
            cellClassRules: {
              'ag-cell-white': params => csswhite.has(params.node.rowIndex),
              'ag-cell-footer-sum': params => csssum.has(params.node.rowIndex),
              'ag-cell-light-green': params => csslightgreen.has(params.node.rowIndex),
              'ag-cell-edit': params => cssedit.has(params.node.rowIndex),
              'ag-cell-light-orange': params => csslightorange.has(params.node.rowIndex)
            }
          },
          {
            headerName: 'Jul',
            colId: 9,
            width: 82,
            valueGetter: getter,
            valueFormatter:formatter,
            valueSetter: setter,
            editable: editable,
            cellEditorParams: { useFormatter: true },
            cellClass: ['text-right'],
            cellClassRules: {
              'ag-cell-white': params => csswhite.has(params.node.rowIndex),
              'ag-cell-footer-sum': params => csssum.has(params.node.rowIndex),
              'ag-cell-light-green': params => csslightgreen.has(params.node.rowIndex),
              'ag-cell-edit': params => cssedit.has(params.node.rowIndex),
              'ag-cell-light-orange': params => csslightorange.has(params.node.rowIndex)
            }
          },
          {
            headerName: 'Aug',
            colId: 10,
            width: 82,
            valueGetter: getter,
            valueFormatter:formatter,
            valueSetter: setter,
            editable: editable,
            cellEditorParams: { useFormatter: true },
            cellClass: ['text-right'],
            cellClassRules: {
              'ag-cell-white': params => csswhite.has(params.node.rowIndex),
              'ag-cell-footer-sum': params => csssum.has(params.node.rowIndex),
              'ag-cell-light-green': params => csslightgreen.has(params.node.rowIndex),
              'ag-cell-edit': params => cssedit.has(params.node.rowIndex),
              'ag-cell-light-orange': params => csslightorange.has(params.node.rowIndex)
            }
          },
          {
            headerName: 'Sep',
            colId: 11,
            width: 82,
            valueGetter: getter,
            valueFormatter:formatter,
            valueSetter: setter,
            editable: editable,
            cellEditorParams: { useFormatter: true },
            cellClass: ['text-right'],
            cellClassRules: {
              'ag-cell-white': params => csswhite.has(params.node.rowIndex),
              'ag-cell-footer-sum': params => csssum.has(params.node.rowIndex),
              'ag-cell-light-green': params => csslightgreen.has(params.node.rowIndex),
              'ag-cell-edit': params => cssedit.has(params.node.rowIndex),
              'ag-cell-light-orange': params => csslightorange.has(params.node.rowIndex)
            }
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
      // if we already have two plans, we can't submit any more
      // also, if we have one plan, but haven't been appropriated yet
      this.submittable = !(this.plans.length === 2
        || (1 === this.plans.length && !this.exeline.appropriated));

      var label: string = (this.exeline.appropriated ? 'After Appropriation' : 'Baseline');
      if (this.plan) {
        label = (SpendPlan.TypeEnum.BASELINE === this.plan.type ? 'Baseline' : 'After Appropriation');
      }
      
      var tmpdata: PlanRow[] = [
        { label: label, values: [], toas:[] },
        { label: 'Obligated', values: [], toas: [] },
        { label: 'Civilian Labor', values: [], toas: [] },
        { label: 'Travel', values: [], toas: [] },
        { label: 'Contracts', values: [], toas: [] },
        { label: 'Other', values: [], toas: [] },
        { label: 'Expensed', values: [], toas: [] },

        { label: 'Cumulative Obligated', values: [], toas: [] },
        { label: 'Cumulative Expensed', values: [], toas: [] },

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

      var totalobl: number = 0;
      var totalexp: number = 0;
      for (var i = 0; i < this.maxmonths; i++) {
        var monthly: SpendPlanMonthly = (this.plan && this.plan.monthlies && i < this.plan.monthlies.length
          ? this.plan.monthlies[i]
          : { obligated: 0, labor: 0, travel: 0, contracts: 0, expensed: 0, other: 0 });

        tmpdata[1].values.push(monthly.obligated);
        tmpdata[2].values.push(monthly.labor);
        tmpdata[3].values.push(monthly.travel);
        tmpdata[4].values.push(monthly.contracts);
        tmpdata[5].values.push(monthly.other);
        tmpdata[6].values.push(monthly.expensed);

        totalobl += monthly.obligated;
        totalexp += monthly.expensed;
        tmpdata[7].values.push(totalobl);
        tmpdata[8].values.push(totalexp);

        // OSD section
        tmpdata[9].values.push(0);
        tmpdata[10].values.push(toas[i].toa * (ogoals.monthlies.length > i ? ogoals.monthlies[i] : 1.0));
        tmpdata[11].values.push(toas[i].toa * (egoals.monthlies.length > i ? egoals.monthlies[i] : 1.0));

        // Delta section
        tmpdata[12].values.push(0);
        tmpdata[13].values.push(tmpdata[8].values[i] - tmpdata[1].values[i]);
        tmpdata[14].values.push(tmpdata[9].values[i] - tmpdata[6].values[i]);

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

  dosave() {
    var newplan: SpendPlan = {
      monthlies: []
    };

    for (var i = 0; i < this.maxmonths; i++) {
      newplan.monthlies.push({
        labor: this.rowData[2].values[i],
        travel: this.rowData[3].values[i],
        contracts: this.rowData[4].values[i],
        other: this.rowData[5].values[i],
        expensed: this.rowData[6].values[i]
      });
    }

    if (this.explanation) {
      newplan.explanation = this.explanation;
    }
    
    if (!this.plans || 0 === this.plans.length) {
      newplan.type = SpendPlan.TypeEnum.BASELINE;
    }
    else if (this.exeline.appropriated) {
      newplan.type = SpendPlan.TypeEnum.AFTERAPPROPRIATION;
    }

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

  submit_check() {
    // make sure we give an explanation if we need to
    var needexplanation: boolean
      = (this.rowData[13].values.filter(val => (val > 10)).length > 0);
    if (!needexplanation) {
      needexplanation = (this.rowData[14].values.filter(val => (val > 10)).length > 0);
    }

    if (needexplanation) {
        $('#explanation-modal').modal('show');
    }
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
