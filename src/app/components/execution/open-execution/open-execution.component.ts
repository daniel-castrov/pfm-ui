import { Component, OnInit, ViewChild } from '@angular/core';

import { Execution, ExecutionService, ExecutionLine } from '../../../generated';
import { Notify } from '../../../utils/Notify'
import { UserUtils } from '../../../services/user.utils'
import { AgGridNg2 } from 'ag-grid-angular';
import { GridOptions } from 'ag-grid';
import { forkJoin } from 'rxjs/observable/forkJoin';
import { SpendPlanService } from '../../../generated';
import { SpendPlan } from '../../../generated';

@Component({
  selector: 'app-open-execution',
  templateUrl: './open-execution.component.html',
  styleUrls: ['./open-execution.component.scss']
})
export class OpenExecutionComponent implements OnInit {
  @ViewChild("agGrid") private agGrid: AgGridNg2;
  private phases: Execution[];
  private phase: Execution;
  private agOptions: GridOptions;
  private exelines: ExecutionLine[];
  private spendplans: Map<string, SpendPlan> = new Map<string, SpendPlan>();

  constructor(private exesvc: ExecutionService, private spsvc:SpendPlanService,
    private userutils: UserUtils) { 
    
    var my: OpenExecutionComponent = this;

    this.agOptions = <GridOptions>{
      enableSorting: true,
      enableFilter: true,
      gridAutoHeight: true,
      pagination: true,
      paginationPageSize: 30,
      suppressPaginationPanel: true,
      context: {},
      columnDefs: [
        {
          headerName: "Program",
          filter: 'agTextColumnFilter',
          cellClass: ['ag-cell-light-grey', 'ag-clickable'],
          field: 'programName'
        },
        {
          headerName: "Appn.",
          filter: 'agTextColumnFilter',
          cellClass: ['ag-cell-light-grey', 'ag-clickable'],
          field: 'appropriation'
        },
        {
          headerName: "BA/BLIN",
          filter: 'agTextColumnFilter',
          cellClass: ['ag-cell-light-grey', 'ag-clickable'],
          field: 'blin'
        },
        {
          headerName: "Item",
          filter: 'agTextColumnFilter',
          cellClass: ['ag-cell-light-grey', 'ag-clickable'],
          field: 'item'
        },
        {
          headerName: "OpAgency",
          filter: 'agTextColumnFilter',
          cellClass: ['ag-cell-light-grey', 'ag-clickable'],
          field: 'opAgency',
        },
        {
          headerName: "PE",
          filter: 'agTextColumnFilter',
          cellClass: ['ag-cell-light-grey', 'ag-clickable'],
          field: 'programElement',
        },
        {
          headerName: 'Plan',
          filter: 'agTextColumnFilter',
          cellClass: ['ag-cell-light-grey', 'ag-clickable'],
          valueGetter: p => (my.spendplans.has(p.data.id)
            ? 'Complete'
            : 'Missing' ),
        },
      ]
    };

  }

  ngOnInit() {
    this.userutils.user().subscribe(user => { 
      this.exesvc.getByCommunityId(user.currentCommunityId, Execution.TypeEnum.CREATED).subscribe(exes => {
        this.phases = exes.result;
        if (this.phases.length > 0) {
          this.phase = this.phases[0];
          this.updatetable();
        }
      });
    });
  }

  updatetable() {
    forkJoin([
      this.exesvc.getExecutionLinesByPhase(this.phase.id),
      this.spsvc.getByExecutionPhaseId(this.phase.id, SpendPlan.TypeEnum.BASELINE)
    ]).subscribe((d:any) => {
      var ok: boolean = true;
      d.forEach( (xx:any) => { 
        if (xx.error) {
          Notify.error(xx.error);
          ok = false;
        }
      });

      if (ok) {
        this.spendplans.clear();
        d[1].result.forEach( (sp:SpendPlan) => { 
          this.spendplans.set(sp.executionLineId, sp);
        });
        this.exelines = d[0].result;
      }
    });
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
}
