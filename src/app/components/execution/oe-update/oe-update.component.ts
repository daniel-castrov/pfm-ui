import {Component, OnInit, ViewChild} from '@angular/core';
import {GridOptions} from 'ag-grid-community';
import {AgGridNg2} from 'ag-grid-angular';
import {FormatterUtil} from '../../../utils/formatterUtil';
import {
  Execution,
  ExecutionLine,
  ExecutionService,
  LibraryService,
  MRDBService,
  MyDetailsService,
  OandEMonthly,
  OandEService
} from '../../../generated';
import {forkJoin} from 'rxjs/internal/observable/forkJoin';
import {ProgramCellRendererComponent} from '../../renderers/program-cell-renderer/program-cell-renderer.component';
import {SessionUtil} from '../../../utils/SessionUtil';


@Component({
  selector: 'oe-update',
  templateUrl: './oe-update.component.html',
  styleUrls: ['./oe-update.component.scss']
})

export class OeUpdateComponent implements OnInit {
  @ViewChild('agGrid') private agGrid: AgGridNg2;

  private programs: Map<string, string> = new Map<string, string>();
  private datalines: OandEExecutionRow[];
  private exephases: Execution[];
  private selectedexe: Execution;
  private hasAppropriation: boolean;
  private agOptions: GridOptions;
  private latestGfebsAsOf:string;
  private latestDaiAsOf:string;

  constructor(private exesvc: ExecutionService,
              private usersvc: MyDetailsService,
              private mrdbService: MRDBService,
              private oandesvc: OandEService,
              private librarysvc: LibraryService) {

    const agcomps: any = {
      programCellRendererComponent: ProgramCellRendererComponent
    };

    this.agOptions = <GridOptions>{
      defaultColDef: { 
        sorting: true,
        resizable: true
      },
      pagination: true,
      paginationPageSize: 20,
      suppressPaginationPanel: true,
      suppressDragLeaveHidesColumns: true,
      suppressMovableColumns: true,
      frameworkComponents: agcomps,
      context: {
        route: '/program-execution-line',
        enabled: true
      },
      columnDefs: [
        {
          headerName: 'Program',
          headerTooltip: 'Program',
          field: 'programName',
          filter: 'agTextColumnFilter',
          cellRenderer: 'programCellRendererComponent',
          cellClass: ['ag-cell-light-grey', 'ag-link'],
        },
        {
          headerName: 'APPN',
          headerTooltip: 'Appropriation',
          field: 'el.appropriation',
          cellClass: ['ag-cell-light-grey'],
          maxWidth: 92
        },
        {
          headerName: 'BA/BLIN',
          headerTooltip: 'BA/BLIN',
          field: 'el.blin',
          cellClass: ['ag-cell-light-grey'],
          maxWidth: 92
        },
        {
          headerName: 'Item',
          headerTooltip: 'Item',
          field: 'el.item',
          cellClass: ['ag-cell-light-grey'],
          maxWidth: 92
        },
        {
          headerName: 'OA',
          headerTooltip: 'OA',
          field: 'el.opAgency',
          cellClass: ['ag-cell-light-grey'],
          maxWidth: 92
        },
        {
          headerName: 'PE',
          headerTooltip: 'PE',
          field: 'el.programElement',
          cellClass: ['ag-cell-light-grey'],
          maxWidth: 92
        },
        {
          headerName: 'TOA',
          headerTooltip: 'TOA',
          field: 'el.toa',
          cellClass: ['ag-cell-light-green'],
          type: 'numericColumn',
          valueFormatter: params => FormatterUtil.currencyFormatter(params, 2, false),
          maxWidth: 92
        },
        {
          headerName: 'Released',
          headerTooltip: 'Released',
          field: 'el.released',
          cellClass: ['ag-cell-white'],
          type: 'numericColumn',
          valueFormatter: params => FormatterUtil.currencyFormatter(params, 2, false),
          maxWidth: 92
        },
        {
          headerName: 'Obligated',
          headerTooltip: 'Obligated',
          field: 'obligated',
          cellClass: ['ag-cell-white'],
          valueFormatter: params => FormatterUtil.currencyFormatter(params, 2, false),
          type: 'numericColumn',
          maxWidth: 92
        },
        {
          headerName: 'Expended',
          headerTooltip: 'Expended',
          field: 'expensed',
          valueFormatter: params => FormatterUtil.currencyFormatter(params, 2, false),
          type: 'numericColumn',
          cellClass: ['ag-cell-white'],
          maxWidth: 92
        },
        {
          headerName: 'Plan',
          headerTooltip: 'Plan',
          field: 'plan',
          cellClass: ['ag-cell-white'],
          type: 'numericColumn',
          maxWidth: 92
        },
        {
          headerName: 'Last Upated',
          headerTooltip: 'Last Upated',
          field: 'lastupd',
          cellClass: ['ag-cell-white'],
          maxWidth: 92
        }
      ]
    };
  }

  ngOnInit() {
    this.usersvc.getCurrentUser().subscribe(deets => {
      forkJoin([
        this.mrdbService.getIdNameMap(),
        this.exesvc.getAll(),
        this.librarysvc.getByKeyAndValue("area", "gfebs"),
        this.librarysvc.getByKeyAndValue("area", "dai"),

      ]).subscribe(data => {
        this.programs = new Map<string, string>();
        Object.getOwnPropertyNames(data[0].result).forEach(mrid => {
          this.programs.set(mrid, data[0].result[mrid]);
        });

        this.exephases = data[1].result;
        if (SessionUtil.get('execution')) {
          this.selectedexe = this.exephases.find(e => e.fy === SessionUtil.get('execution').fy);
        } else {
          this.selectedexe = this.exephases[0];
          SessionUtil.set('execution', this.selectedexe);
        }
        this.fetchLines();
        this.latestGfebsAsOf = this.getLatestAsOf(data[2].result);
        this.latestDaiAsOf = this.getLatestAsOf(data[3].result);
      });
    });


  }

  getLatestAsOf( filesmetadata:any ){
    let latest:string = "";
    filesmetadata.forEach( fmd  => {
      if ( fmd.metadata.asof > latest ) {
        latest=fmd.metadata.asof;
      }
    });

    if (latest !=""){
      return latest;
    }
    return null;
  }


  fetchLines() {
    this.agOptions.api.showLoadingOverlay();
    if (!this.selectedexe) {
      this.datalines = [];
      this.agOptions.api.showNoRowsOverlay();
      return;
    }

    forkJoin([
      this.exesvc.hasAppropriation(this.selectedexe.id),
      this.exesvc.getExecutionLinesByPhase(this.selectedexe.id),
      this.oandesvc.getByPhaseId(this.selectedexe.id)
    ]).subscribe(data => {
      this.hasAppropriation = data[0].result;
      if (0 === data[1].result.length) {
        this.agOptions.api.showNoRowsOverlay();
      } else {
        this.agOptions.api.hideOverlay();

        const newData: OandEExecutionRow[] = [];
        data[1].result.forEach((el: ExecutionLine) => {
          const wrap: OandEExecutionRow = {
            id: el.id,
            programName: el.programName,
            exe: this.selectedexe,
            el: el,
            lastupd: new Date(0),
            accruals: 0,
            committed: 0,
            obligated: 0,
            expensed: 0
          };

          data[2].result
            .filter((oe: OandEMonthly) => (oe.executionLineId === el.id))
            .forEach((oe: OandEMonthly) => {
              wrap.accruals += oe.accruals;
              wrap.committed += oe.committed;
              wrap.obligated += oe.obligated;
              wrap.expensed += oe.expensed;

              const oeupd: Date = new Date(oe.lastUpdated);
              if (oeupd > wrap.lastupd) {
                wrap.lastupd = oeupd;
              }
            });

          newData.push(wrap);
        });

        this.datalines = newData;
      }

      this.agGrid.api.sizeColumnsToFit();
      this.agGrid.api.refreshHeader();
    });
    SessionUtil.set('execution', this.selectedexe);
  }


  onPageSizeChanged(event) {
    const selectedValue = Number(event.target.value);
    this.agGrid.api.paginationSetPageSize(selectedValue);
    this.agGrid.api.sizeColumnsToFit();
  }

  onGridReady(params) {
    setTimeout(() => {
      params.api.sizeColumnsToFit();
    }, 500);
    window.addEventListener('resize', () => {
      setTimeout(() => {
        params.api.sizeColumnsToFit();
      });
    });
  }
}

interface OandEExecutionRow {
  programName: string;
  id: string;
  exe: Execution;
  el: ExecutionLine;
  expensed: number;
  obligated: number;
  accruals: number;
  committed: number;
  lastupd?: Date;
}
