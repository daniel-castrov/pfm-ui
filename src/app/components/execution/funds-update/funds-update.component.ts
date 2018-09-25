import { Component, OnInit, ViewChild, ViewEncapsulation } from '@angular/core'

// Other Components
import { HeaderComponent } from '../../header/header.component'
import { Router } from '@angular/router'
import { ExecutionService, Execution, MyDetailsService, ExecutionLine } from '../../../generated'
import { forkJoin } from 'rxjs/observable/forkJoin';
import { ProgramsService } from '../../../generated/api/programs.service';
import { GridOptions } from 'ag-grid';
import { AgGridNg2 } from 'ag-grid-angular';
import { ProgramCellRendererComponent } from '../../renderers/program-cell-renderer/program-cell-renderer.component';
import { EventDetailsCellRendererComponent } from '../../renderers/event-details-cell-renderer/event-details-cell-renderer.component';
import { AutoValuesService} from '../../programming/program-request/funds-tab/AutoValues.service'

@Component({
  selector: 'funds-update',
  templateUrl: './funds-update.component.html',
  styleUrls: ['./funds-update.component.scss'],
  encapsulation: ViewEncapsulation.None
})

export class FundsUpdateComponent implements OnInit {
  @ViewChild(HeaderComponent) header;
  @ViewChild("agGrid") private agGrid: AgGridNg2;

  private exephases: Execution[];
  private selectedexe: Execution;
  private exelines: ExecutionLine[] = [];
  private programs: string[] = [];
  private appropriations: string[] = [];
  private blins: string[] = [];
  private items: string[] = [];
  private opAgencies: string[] = [];
  private selectedRow: number = -1;
  private programName: string;
  private appropriation: string;
  private blin: string;
  private item: string;
  private opAgency: string;
  private funds: number;
  private menuTabs = ['filterMenuTab'];
  private hasAppropriation: boolean = false;

  private agOptions: GridOptions;

  constructor(private exesvc: ExecutionService, private usersvc: MyDetailsService,
    private progsvc: ProgramsService, private autovalues: AutoValuesService,
    private router: Router) {
    var my: FundsUpdateComponent = this;

    var agcomps:any = {
      programCellRendererComponent: ProgramCellRendererComponent,
      eventDetailsCellRendererComponent : EventDetailsCellRendererComponent
    };

    var programLinkEnabled = function (params): boolean {
      return (0 !== params.data.released);
    };

    this.agOptions = <GridOptions>{
      enableSorting: true,
      enableFilter: true,
      gridAutoHeight: true,
      pagination: true,
      paginationPageSize: 20,
      suppressPaginationPanel: true,
      frameworkComponents: agcomps,
      context: {
        route: '/update-program-execution',
        enabled: programLinkEnabled
      },
      columnDefs: [
        {
          width: 50,
          headerName: "View",
          headerTooltip: 'View',
          filter: 'agTextColumnFilter',
          cellRenderer: 'eventDetailsCellRendererComponent',
          menuTabs: this.menuTabs,
          cellClass: ['ag-cell-light-grey','ag-clickable'],
          field: 'programName',
        },
        {
          headerName: "Program",
          headerTooltip: 'Program',
          field: 'programName',
          filter: 'agTextColumnFilter',
          cellRenderer: 'programCellRendererComponent',
          menuTabs: this.menuTabs,
          cellClass: ['ag-cell-light-grey','ag-clickable'],
          editable: p => (!p.data.programName)
        },
        {
          headerName: 'Appn.',
          headerTooltip: 'Appropriation',
          filter: 'agTextColumnFilter',
          field: 'appropriation',
          width: 92,
          menuTabs: this.menuTabs,
          cellClass: ['ag-cell-light-grey'],
          editable: p => (!p.data.appropriation),
          cellEditor: 'agRichSelectCellEditor',
          cellEditorParams: params => ({ values: my.appropriations })
        },
        {
          headerName: 'BA/BLIN',
          headerTooltip: 'BA/BLIN',
          filter: 'agTextColumnFilter',
          field: 'blin',
          width: 92,
          menuTabs: this.menuTabs,
          cellClass: ['ag-cell-light-grey'],
          editable: p => (!p.data.blin),
          cellEditor: 'agRichSelectCellEditor',
          cellEditorParams: params => ({ values: my.blins }),
          valueSetter: p => {
            p.data.blin = p.newValue;
            autovalues.programElement(p.newValue, p.data.item ? p.data.item : '').then(val => {
              p.data.programElement = val;
            });
            return true;
          }
        },
        {
          headerName: 'Item',
          headerTooltip: 'Item',
          filter: 'agTextColumnFilter',
          field: 'item',
          width: 92,
          menuTabs: this.menuTabs,
          cellClass: ['ag-cell-light-grey'],
          editable: p => (!p.data.item),
        },
        {
          headerName: 'opAgency',
          headerTooltip: 'opAgency',
          filter: 'agTextColumnFilter',
          field: 'opAgency',
          width: 92,
          menuTabs: this.menuTabs,
          cellClass: ['ag-cell-light-grey', 'text-center'],
          editable: p => (!p.data.opAgency),
          cellEditor: 'agRichSelectCellEditor',
          cellEditorParams: params => ({ values: my.opAgencies })
        },
        {
          headerName: 'PE',
          headerTooltip: 'PE',
          filter: 'agTextColumnFilter',
          field: 'programElement',
          width: 92,
          menuTabs: this.menuTabs,
          cellClass: ['ag-cell-light-grey', 'text-center']
        },
        {
          headerName: 'Initial Funds',
          headerTooltip: 'Initial Funds',
          headerValueGetter: params => { return( my.selectedexe ? 'PB'+(my.selectedexe.fy-2000 ) : 'Initial Funds' )},
          field: 'initial',
          valueFormatter: params => {return this.currencyFormatter(params)},
          width: 92,
          suppressSorting: false,
          suppressMenu: true,
          cellClass: ['ag-cell-light-green', 'text-right'],
          editable: p => (!p.data.initial),
          valueSetter: p => {
            p.data.toa = Number.parseFloat(p.newValue);
            p.data.initial = Number.parseFloat(p.newValue);

            this.exesvc.createExecutionLine(this.selectedexe.id, p.data).subscribe(data => {
              console.log('created new EL');
              console.log(data.result);

              p.data.id = data.result;
              this.refreshFilterDropdowns();
            });

            return true;
          }
        },
        {
          headerName: 'CRA',
          headerTooltip: 'CRA',
          field: 'craTotal',
          valueFormatter: params => {return this.currencyFormatter(params)},
          width: 92,
          suppressSorting: false,
          suppressMenu: true,
          cellClass: ['ag-cell-white','text-right']
        },
        {
          headerName: 'Realigned',
          headerTooltip: 'Realigned',
          field: 'realignedTotal',
          valueFormatter: params => {return this.currencyFormatter(params)},
          width: 92,
          suppressSorting: false,
          suppressMenu: true,
          cellClass: ['ag-cell-white','text-right']
        },
        {
          headerName: 'Appr. Actions',
          headerTooltip: 'Appr. Actions',
          field: 'apprTotal',
          valueFormatter: params => {return this.currencyFormatter(params)},
          width: 92,
          suppressSorting: false,
          suppressMenu: true,
          cellClass: ['ag-cell-white','text-right']
        },
        {
          headerName: 'OUSD(C) Actions',
          headerTooltip: 'OUSD(C) Actions',
          field: 'ousdcTotal',
          valueFormatter: params => {return this.currencyFormatter(params)},
          width: 92,
          suppressSorting: false,
          suppressMenu: true,
          cellClass: ['ag-cell-white','text-right']
        },
        {
          headerName: 'BTR',
          headerTooltip: 'BTR',
          field: 'btrTotal',
          valueFormatter: params => {return this.currencyFormatter(params)},
          width: 92,
          suppressSorting: false,
          suppressMenu: true,
          cellClass: ['ag-cell-white','text-right']
        },
        {
          headerName: 'TOA',
          headerTooltip: 'TOA',
          field: 'toa',
          valueFormatter: params => {return this.currencyFormatter(params)},
          width: 92,
          suppressSorting: false,
          suppressMenu: true,
          cellClass: ['ag-cell-dark-green','text-right']
        },
        {
          headerName: 'Released',
          headerTooltip: 'Released',
          field: 'released',
          valueFormatter: params => {return this.currencyFormatter(params)},
          width: 92,
          suppressSorting: false,
          suppressMenu: true,
          cellClass: ['ag-cell-dark-green','text-right']
        },
        {
          headerName: 'Withheld',
          headerTooltip: 'Withheld',
          field: 'withheld',
          valueFormatter: params => { return this.currencyFormatter(params) },
          width: 92,
          suppressSorting: false,
          suppressMenu: true,
          cellClass: ['ag-cell-dark-green', 'text-right']
        }
      ]
    };
  }

  ngOnInit() {
    var my: FundsUpdateComponent = this;
    my.usersvc.getCurrentUser().subscribe(deets => {
      forkJoin([
        //my.exesvc.getByCommunity(deets.result.currentCommunityId, 'OPEN'),
        my.exesvc.getByCommunityId(deets.result.currentCommunityId, 'CREATED')
      ]).subscribe(data => {
        my.exephases = data[0].result;
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
      this.exesvc.getExecutionLinesByPhase(this.selectedexe.id),
      this.exesvc.hasAppropriation(this.selectedexe.id)
    ]).subscribe(data => {
      this.exelines = data[0].result;
      if (0 == this.exelines.length) {
        this.agOptions.api.showNoRowsOverlay();
      }
      else {
        this.agOptions.api.hideOverlay();
      }
      this.refreshFilterDropdowns();

      this.hasAppropriation = data[1].result;
    });
  }

  currencyFormatter(value) {
    if(isNaN(value.value)) {
      value.value = 0;
    }
    var usdFormate = new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    });
    return usdFormate.format(value.value);
  }

  refreshFilterDropdowns() {
    var my: FundsUpdateComponent = this;
    var apprset: Set<string> = new Set<string>();
    var itemset: Set<string> = new Set<string>();
    var blinset: Set<string> = new Set<string>();
    var agencyset: Set<string> = new Set<string>();

    my.exelines.forEach((x: ExecutionLine) => {
      if (x.appropriation) {
        apprset.add(x.appropriation.trim());
      }
      if (x.item) {
        itemset.add(x.item.trim());
      }
      if (x.blin) {
        blinset.add(x.blin.trim());
      }
      if (x.opAgency) {
        agencyset.add(x.opAgency.trim());
      }
    });

    my.appropriations = [];
    apprset.forEach(s => {
      my.appropriations.push(s);
    });

    my.items = [];
    itemset.forEach(s => {
      my.items.push(s);
    });

    my.blins = [];
    blinset.forEach(s => {
      my.blins.push(s);
    });

    my.opAgencies = [];
    agencyset.forEach(s => {
      my.opAgencies.push(s);
    });

    my.appropriations.sort();
    my.items.sort();
    my.blins.sort();
    my.opAgencies.sort();
  }

  addline() {
    this.agOptions.api.updateRowData({ add: [{}] });
    this.agOptions.api.paginationGoToLastPage();
    this.agOptions.api.startEditingCell({
      rowIndex: this.agOptions.api.getLastDisplayedRow(),
      colKey: 'programName'
    });
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

  onSelectionChanged() {
    this.agOptions.api.getSelectedRows().forEach(row => {
      this.selectedRow = row;
    });
  }

  onPageSizeChanged(event) {
    var selectedValue = Number(event.target.value);
    this.agGrid.api.paginationSetPageSize(selectedValue);
    this.agGrid.api.sizeColumnsToFit();
  }
}
