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
import { UfrStatus } from '../../../generated';

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
  private columnDefs: any[];
  private rowData: PlanRow[];
  private plans: SpendPlan[];
  private plan: SpendPlan;

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
    this.agOptions = <GridOptions>{
      enableColResize: true,
    }

    var my: SpendPlansTabComponent = this;
    var getHeaderValue1 = function (p) {
      return (my._exeline ? my.exeline.appropriation : '');
    }

    var getHeaderValueFy = function (p) {
      var inty: number = my.firstMonth / 12;
      return (my._exe ? 'FY' + (my.exe.fy + inty) : 'First Year');
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
      my.plan = my.plans.filter(sp => (sp.type === p.newValue))[0];
      return true;
    }

    this.columnDefs = [
      {
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
            cellEditor: 'agRichSelectEditor',
            cellEditorParams: {
              values: ['Baseline', 'After Appropriation']
            },
            valueSetter: setPlan,
            maxWidth: 220,
            cellClass: ['ag-cell-white'],
            // colSpan: function(params) {
            //    var spendplans = params.data.spendplans;
            //    if (spendplans === "Baseline") {
            //      return 2;
            //    } else if (spendplans === "Obligated") {
            //      return 4;
            //    } else {
            //      return 1;
            //   }
            // }
          }
        ],
      },
      {
        headerValueGetter: getHeaderValueFy,
        children: [
          {
            headerName: 'Oct',
            colId: 0,
            valueGetter: getter,
            valueFormatter: p => ('' === p.value ? '' : p.value.toFixed(2)),
            cellClass: ['ag-cell-white', 'text-right']
          },
          {
            headerName: 'Nov',
            colId: 1,
            valueGetter: getter,
            valueFormatter: p => ('' === p.value ? '' : p.value.toFixed(2)),
            cellClass: ['ag-cell-white', 'text-right']
          },
          {
            headerName: 'Dec',
            colId: 2,
            valueGetter: getter,
            valueFormatter: p => ('' === p.value ? '' : p.value.toFixed(2)),
            cellClass: ['ag-cell-white', 'text-right']
          },
          {
            headerName: 'Jan',
            colId: 3,
            valueGetter: getter,
            valueFormatter: p => ('' === p.value ? '' : p.value.toFixed(2)),
            cellClass: ['ag-cell-white', 'text-right']
          },
          {
            headerName: 'Feb',
            colId: 4,
            valueGetter: getter,
            valueFormatter: p => ('' === p.value ? '' : p.value.toFixed(2)),
            cellClass: ['ag-cell-white', 'text-right']
          },
          {
            headerName: 'Mar',
            colId: 5,
            valueGetter: getter,
            valueFormatter: p => ('' === p.value ? '' : p.value.toFixed(2)),
            cellClass: ['ag-cell-white', 'text-right']
          },
          {
            headerName: 'Apr',
            colId: 6,
            valueGetter: getter,
            valueFormatter: p => ('' === p.value ? '' : p.value.toFixed(2)),
            cellClass: ['ag-cell-white', 'text-right']
          },
          {
            headerName: 'May',
            colId: 7,
            valueGetter: getter,
            valueFormatter: p => ('' === p.value ? '' : p.value.toFixed(2)),
            cellClass: ['ag-cell-white', 'text-right']
          },
          {
            headerName: 'Jun',
            colId: 8,
            valueGetter: getter,
            valueFormatter: p => ('' === p.value ? '' : p.value.toFixed(2)),
            cellClass: ['ag-cell-white', 'text-right']
          },
          {
            headerName: 'Jul',
            colId: 9,
            valueGetter: getter,
            valueFormatter: p => ('' === p.value ? '' : p.value.toFixed(2)),
            cellClass: ['ag-cell-white', 'text-right']
          },
          {
            headerName: 'Aug',
            colId: 10,
            valueGetter: getter,
            valueFormatter: p => ('' === p.value ? '' : p.value.toFixed(2)),
            cellClass: ['ag-cell-white', 'text-right']
          },
          {
            headerName: 'Sep',
            colId: 11,
            valueGetter: getter,
            valueFormatter: p => ('' === p.value ? '' : p.value.toFixed(2)),
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
      if (!this.plan) {
        this.rowData = [];
        return;
      }

      var tmpdata:PlanRow[] = [
        { label: (SpendPlan.TypeEnum.BASELINE === this.plan.type ?  'Baseline' : 'After Appropriation' ), values:[] },
        { label: 'Obligated', values:[] },
        { label: 'Civilian Labor', values:[] },
        { label: 'Travel', values:[] },
        { label: 'Contracts', values:[] },
        { label: 'Other', values: [] },
        { label: 'Expensed', values: [] },
        { label: 'OSD', values:[] },
        { label: 'Obligated', values:[] },
        { label: 'Expensed', values:[] },
        { label: 'DELTA', values:[] },
        { label: 'Obligated', values:[] },
        { label: 'Expensed', values:[] },
      ];

      var progtype: string = this.exeline.appropriation;
      var ogoals: OSDGoalPlan = this.exe.osdObligationGoals[progtype];
      var egoals: OSDGoalPlan = this.exe.osdExpenditureGoals[progtype];
      var max = Math.max(ogoals.monthlies.length, egoals.monthlies.length);

      var toas: ToaAndReleased[] = OandETools.calculateToasAndReleaseds(this.exeline, this.deltas, max, this.exe.fy);

      for (var i = 0; i < max; i++){
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
      }

      this.rowData = tmpdata;
    }
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
}

interface PlanRow {
  label: string,
  values: number[];
}