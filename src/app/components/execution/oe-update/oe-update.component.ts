import { Component, OnInit, ViewChild } from '@angular/core'
import { Router } from '@angular/router'

// Other Components
import { HeaderComponent } from '../../header/header.component'
import { GridOptions } from 'ag-grid';
import { AgGridNg2 } from 'ag-grid-angular';

import { ExecutionService, Execution, MyDetailsService, ExecutionLine, OandEMonthly, OandEService } from '../../../generated'
import { forkJoin } from 'rxjs/observable/forkJoin';
import { ProgramsService } from '../../../generated/api/programs.service';
import { ProgramCellRendererComponent } from '../../renderers/program-cell-renderer/program-cell-renderer.component';


@Component({
  selector: 'oe-update',
  templateUrl: './oe-update.component.html',
  styleUrls: ['./oe-update.component.scss']
})

export class OeUpdateComponent implements OnInit {
  @ViewChild(HeaderComponent) header;
  @ViewChild("agGrid") private agGrid: AgGridNg2;

  private programs: Map<string, string> = new Map<string, string>();
  private datalines: OandEExecutionRow[];
  private exephases: Execution[];
  private selectedexe: Execution;
  private hasAppropriation: boolean;
  private agOptions: GridOptions;

  constructor(private exesvc: ExecutionService, private usersvc: MyDetailsService,
    private progsvc: ProgramsService, private oandesvc:OandEService, private router: Router) {
    var my: OeUpdateComponent = this;

    var agcomps: any = {
      programCellRendererComponent: ProgramCellRendererComponent
    };

    console.error( 'FIXME: we used to deal with MRIDs, now we have straight PROGRAMNAMEs')
    my.progsvc.getIdNameMap().subscribe(data => {
      Object.getOwnPropertyNames(data.result).forEach(mrId => {
        my.programs.set(mrId, data.result[mrId]);
      });
    });

    this.agOptions = <GridOptions>{
      enableSorting: true,
      enableFilter: true,
      gridAutoHeight: true,
      pagination: true,
      paginationPageSize: 30,
      suppressPaginationPanel: true,
      frameworkComponents: agcomps,
      context: {
        programlkp: my.programs,
        route: '/program-execution-line',
        enabled: x=>true
      },
      columnDefs: [
        {
          headerName: 'Program',
          field: 'programName',
          filter: 'agTextColumnFilter',
          cellClass: ['ag-cell-light-grey', 'ag-link'],
        },
        {
          headerName: 'Appr',
          field: 'el.appropriation',
          cellClass: ['ag-cell-light-grey'],
          maxWidth: 92
        },
        {
          headerName: 'Budget',
          field: 'el.blin',
          cellClass: ['ag-cell-light-grey'],
          maxWidth: 92
        },
        {
          headerName: 'Item',
          field: 'el.item',
          cellClass: ['ag-cell-light-grey'],
          maxWidth: 92
        },
        {
          headerName: 'OpAgency',
          field: 'el.opAgency',
          cellClass: ['ag-cell-light-grey'],
          maxWidth: 92
        },
        {
          headerName: 'PE',
          field: 'el.programElement',
          cellClass: ['ag-cell-light-grey'],
          maxWidth: 92
        },
        {
          headerName: 'TOA',
          field: 'el.toa',
          cellClass: ['ag-cell-light-green'],
          type: 'numericColumn',
          maxWidth: 92
        },
        {
          headerName: 'Released',
          field: 'el.released',
          cellClass: ['ag-cell-white'],
          type: 'numericColumn',
          maxWidth: 92
        },
        {
          headerName: 'Obligated',
          field: 'obligated',
          cellClass: ['ag-cell-white'],
          type: 'numericColumn',
          maxWidth: 92
        },
        {
          headerName: 'Outlayed',
          field: 'outlayed',
          type: 'numericColumn',
          cellClass: ['ag-cell-white'],
          maxWidth: 92
        },
        {
          headerName: 'Plan',
          field: 'plan',
          cellClass: ['ag-cell-white'],
          type: 'numericColumn',
          maxWidth: 92
        },
        {
          headerName: 'Last Upated',
          field: 'lastupd',
          cellClass: ['ag-cell-white'],
          maxWidth: 92
        }
      ]
    };
  }

  ngOnInit() {
    var my: OeUpdateComponent = this;
    my.usersvc.getCurrentUser().subscribe(deets => {
      forkJoin([
        my.progsvc.getIdNameMap(),
        //my.exesvc.getByCommunity(deets.result.currentCommunityId, 'OPEN'),
        my.exesvc.getByCommunityId(deets.result.currentCommunityId, 'CREATED'),
      ]).subscribe(data => {
        my.programs = new Map<string, string>();
        Object.getOwnPropertyNames(data[0].result).forEach(mrid => {
          my.programs.set(mrid, data[0].result[mrid]);
        });

        my.exephases = data[1].result;
        my.selectedexe = my.exephases[0];
        this.agOptions.api.showLoadingOverlay();
        my.fetchLines();
        this.agGrid.api.sizeColumnsToFit();
        this.agGrid.api.refreshHeader();
      });
    });

  }

  fetchLines() {
    if (!this.selectedexe) {
      this.agOptions.api.showNoRowsOverlay();
      return;
    }

    forkJoin([
      this.exesvc.hasAppropriation(this.selectedexe.id),
      this.exesvc.getExecutionLinesByPhase(this.selectedexe.id),
      this.oandesvc.getByPhaseId(this.selectedexe.id)
    ]).subscribe(data => {
      this.hasAppropriation = data[0].result;
      if (0 == data[1].result.length) {
        this.agOptions.api.showNoRowsOverlay();
      }
      else {
        this.agOptions.api.hideOverlay();

        var newdata: OandEExecutionRow[] = [];
        data[1].result.forEach((el: ExecutionLine) => {
          var wrap: OandEExecutionRow = {
            id: el.id,
            programName: el.programName,
            exe: this.selectedexe,
            el: el,
            lastupd: new Date(0),
            accruals: 0,
            committed: 0,
            obligated: 0,
            outlayed: 0
          };

          data[2].result
            .filter((oe: OandEMonthly) => (oe.executionLineId === el.id))
            .forEach((oe: OandEMonthly) => {
              wrap.accruals += oe.accruals;
              wrap.committed += oe.committed;
              wrap.obligated += oe.obligated;
              wrap.outlayed += oe.outlayed;

              var oeupd: Date = new Date(oe.lastUpdated);
              if (oeupd > wrap.lastupd) {
                wrap.lastupd = oeupd;
              }
            });

          newdata.push(wrap);
        });

        this.datalines = newdata;
      }
    });
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

interface OandEExecutionRow {
  programName: string,
  id: string,
  exe: Execution,
  el: ExecutionLine,
  outlayed: number,
  obligated: number,
  accruals: number,
  committed: number,
  lastupd?: Date
}
