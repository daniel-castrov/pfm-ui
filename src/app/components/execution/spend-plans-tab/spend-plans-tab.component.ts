import { Component, OnInit, ViewChild, Input } from '@angular/core'

// Other Components
import { HeaderComponent } from '../../header/header.component'
import { Router } from '@angular/router'
import { ProgramsService } from '../../../generated/api/programs.service';
import { GridOptions } from 'ag-grid';
import { AgGridNg2 } from 'ag-grid-angular';
import { ProgramCellRendererComponent } from '../../renderers/program-cell-renderer/program-cell-renderer.component';
import { OandEMonthly, ExecutionLine, Execution, ExecutionEvent, OSDGoalPlan } from '../../../generated';
import { getParentRenderElement } from '@angular/core/src/view/util';
import { getTypeNameForDebugging } from '@angular/common/src/directives/ng_for_of';
import { AddSpendPlanComponent } from '../add-spend-plan/add-spend-plan.component';

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

  @Input() set exeline(e: ExecutionLine) {
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
      return '(' + row + ',' + col + ')';
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
            field: 'label',
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
            cellClass: ['ag-cell-white', 'text-right']
          },
          {
            headerName: 'Nov',
            colId: 1,
            valueGetter: getter,
            cellClass: ['ag-cell-white', 'text-right']
          },
          {
            headerName: 'Dec',
            colId: 2,
            valueGetter: getter,
            cellClass: ['ag-cell-white', 'text-right']
          },
          {
            headerName: 'Jan',
            colId: 3,
            valueGetter: getter,
            cellClass: ['ag-cell-white', 'text-right']
          },
          {
            headerName: 'Feb',
            colId: 4,
            valueGetter: getter,
            cellClass: ['ag-cell-white', 'text-right']
          },
          {
            headerName: 'Mar',
            colId: 5,
            valueGetter: getter,
            cellClass: ['ag-cell-white', 'text-right']
          },
          {
            headerName: 'Apr',
            colId: 6,
            valueGetter: getter,
            cellClass: ['ag-cell-white', 'text-right']
          },
          {
            headerName: 'May',
            colId: 7,
            valueGetter: getter,
            cellClass: ['ag-cell-white', 'text-right']
          },
          {
            headerName: 'Jun',
            colId: 8,
            valueGetter: getter,
            cellClass: ['ag-cell-white', 'text-right']
          },
          {
            headerName: 'Jul',
            colId: 9,
            valueGetter: getter,
            cellClass: ['ag-cell-white', 'text-right']
          },
          {
            headerName: 'Aug',
            colId: 10,
            valueGetter: getter,
            cellClass: ['ag-cell-white', 'text-right']
          },
          {
            headerName: 'Sep',
            colId: 11,
            valueGetter: getter,
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
      var tmpdata:PlanRow[] = [
        { label: 'Baseline', obligated: [], inhouse: [], contracted: [], expensed: [], osdobligated: [], osdexpensed: [], deltaobligated: [], deltaexpensed: [] },
        { label: 'Obligated', obligated: [], inhouse: [], contracted: [], expensed: [], osdobligated: [], osdexpensed: [], deltaobligated: [], deltaexpensed: [] },
        { label: 'Civilian Labor', obligated: [], inhouse: [], contracted: [], expensed: [], osdobligated: [], osdexpensed: [], deltaobligated: [], deltaexpensed: [] },
        { label: 'Travel', obligated: [], inhouse: [], contracted: [], expensed: [], osdobligated: [], osdexpensed: [], deltaobligated: [], deltaexpensed: [] },
        { label: 'Contracts', obligated: [], inhouse: [], contracted: [], expensed: [], osdobligated: [], osdexpensed: [], deltaobligated: [], deltaexpensed: [] },
        { label: 'Other', obligated: [], inhouse: [], contracted: [], expensed: [], osdobligated: [], osdexpensed: [], deltaobligated: [], deltaexpensed: [] },
        { label: 'OSD', obligated: [], inhouse: [], contracted: [], expensed: [], osdobligated: [], osdexpensed: [], deltaobligated: [], deltaexpensed: [] },
        { label: 'Obligated', obligated: [], inhouse: [], contracted: [], expensed: [], osdobligated: [], osdexpensed: [], deltaobligated: [], deltaexpensed: [] },
        { label: 'Expensed', obligated: [], inhouse: [], contracted: [], expensed: [], osdobligated: [], osdexpensed: [], deltaobligated: [], deltaexpensed: [] },
        { label: 'DELTA', obligated: [], inhouse: [], contracted: [], expensed: [], osdobligated: [], osdexpensed: [], deltaobligated: [], deltaexpensed: [] },
        { label: 'Obligated', obligated: [], inhouse: [], contracted: [], expensed: [], osdobligated: [], osdexpensed: [], deltaobligated: [], deltaexpensed: [] },
        { label: 'Expensed', obligated: [], inhouse: [], contracted: [], expensed: [], osdobligated: [], osdexpensed: [], deltaobligated: [], deltaexpensed: [] },
      ];

      var progtype: string = this.exeline.appropriation;
      var ogoals: OSDGoalPlan = this.exe.osdObligationGoals[progtype];
      var egoals: OSDGoalPlan = this.exe.osdExpenditureGoals[progtype];
      var max = Math.max(ogoals.monthlies.length, egoals.monthlies.length);
      for (var i = 0; i < max; i++){
        tmpdata.forEach(row => { 
          row.obligated.push(0);
          row.inhouse.push(1);
          row.contracted.push(2);
          row.expensed.push(3);
          row.osdobligated.push(4);
          row.osdexpensed.push(5);
          row.deltaobligated.push(6);
          row.deltaexpensed.push(7);
        });
      }

      this.rowData = tmpdata;
    }
  }

  addplan() {
    var newplan = this.addarea.getSpendPlan();
    console.log(newplan);
  }
}

interface PlanRow {
  label: string,
  obligated: number[],
  inhouse: number[],
  contracted: number[],
  expensed:number[],
  osdobligated: number[],
  osdexpensed: number[],
  deltaobligated: number[],
  deltaexpensed: number[]
}