import {Component, HostListener, OnInit, ViewChild, ViewEncapsulation} from '@angular/core';
import {Execution, ExecutionLine, ExecutionService, MyDetailsService} from '../../../generated';
import {forkJoin} from 'rxjs/internal/observable/forkJoin';
import {GridOptions} from 'ag-grid-community';
import {AgGridNg2} from 'ag-grid-angular';
import {ProgramCellRendererComponent} from '../../renderers/program-cell-renderer/program-cell-renderer.component';
import {EventDetailsCellRendererComponent} from '../../renderers/event-details-cell-renderer/event-details-cell-renderer.component';
import {AutoValuesService} from '../../programming/program-request/funds-tab/AutoValues.service';
import {SessionUtil} from '../../../utils/SessionUtil';
import StatusEnum = Execution.StatusEnum;

@Component({
  selector: 'funds-update',
  templateUrl: './funds-update.component.html',
  styleUrls: ['./funds-update.component.scss'],
  encapsulation: ViewEncapsulation.None
})

export class FundsUpdateComponent implements OnInit {
  @ViewChild('agGrid') private agGrid: AgGridNg2;

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
  private hasAppropriation = false;
  private agOptions: GridOptions;
  containerStyle = {width: '100%'};
  hasReleased: boolean;

  constructor(private exesvc: ExecutionService,
              private usersvc: MyDetailsService,
              private autovalues: AutoValuesService) {

    const agcomps = {
      programCellRendererComponent: ProgramCellRendererComponent,
      eventDetailsCellRendererComponent : EventDetailsCellRendererComponent
    };

    const saveIfPossible = (p) => {
      if (p.data.programName && 'Other' !== p.data.programName
        && p.data.appropriation
        && p.data.opAgency
        && p.data.blin
        && p.data.item) {
        p.data.toa = 0;
        p.data.initial = 0;
        p.data.released = 0;
        p.data.withheld = 0;
        this.exesvc.createExecutionLine(this.selectedexe.id, p.data).subscribe(data => {
          p.data.id = data.result;
          this.refreshFilterDropdowns();
        });
      }
    };

    const programLinkEnabled = (params): boolean => {
      if (this.selectedexe && this.selectedexe.status === StatusEnum.OPEN) {
        return (params.data.id && 0 !== params.data.released);
      } else {
        return (params.data.id);
      }
    };

    this.agOptions = <GridOptions>{
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
      defaultColDef: {
        resizable: false,
        sorting: true
      },
      columnDefs: [
        {
          width: 50,
          headerName: 'View',
          headerTooltip: 'View',
          filter: 'agTextColumnFilter',
          cellRenderer: 'eventDetailsCellRendererComponent',
          menuTabs: this.menuTabs,
          cellClass: ['ag-cell-light-grey', 'ag-clickable'],
          field: 'programName',
          suppressSizeToFit: true
        },
        {
          headerName: 'Program',
          width: 115,
          colId: 'programName',
          headerTooltip: 'Program',
          field: 'programName',
          filter: 'agTextColumnFilter',
          cellRenderer: 'programCellRendererComponent',
          menuTabs: this.menuTabs,
          cellClass: ['ag-cell-light-grey'],
          cellClassRules: {
            'ag-link': params => {
              if (this.selectedexe && this.selectedexe.status === StatusEnum.OPEN) {
                return (params.data.id && 0 !== params.data.released);
              } else {
                return (params.data.id);
              }
            }
          },
          editable: p => (!p.data.id),
          cellEditorParams: params => ({ values: this.programs }),
          cellEditorSelector: p => {
            let editor = 'agRichSelectCellEditor';
            if (p.data.programName && 'Other' === p.data.programName) {
              editor = 'agTextCellEditor';
            }
            return { component: editor };
          },
          valueSetter: p => {
            p.data.programName = p.newValue;
            saveIfPossible(p);
            return true;
          },
          suppressSizeToFit: true
        },
        {
          headerName: 'APPN',
          headerTooltip: 'Appropriation',
          filter: 'agTextColumnFilter',
          field: 'appropriation',
          width: 70,
          menuTabs: this.menuTabs,
          cellClass: ['ag-cell-light-grey'],
          editable: p => (!p.data.id),
          cellEditor: 'agRichSelectCellEditor',
          cellEditorParams: params => ({ values: this.appropriations }),
          valueSetter: p => {
            p.data.appropriation = p.newValue;
            delete p.data.blin;
            delete p.data.programElement;
            return true;
          },
          suppressSizeToFit: true
        },
        {
          headerName: 'BA/BLIN',
          headerTooltip: 'BA/BLIN',
          filter: 'agTextColumnFilter',
          field: 'blin',
          width: 90,
          menuTabs: this.menuTabs,
          cellClass: ['ag-cell-light-grey'],
          editable: p => (!p.data.id),
          cellEditor: 'agRichSelectCellEditor',
          cellEditorParams: p => (
            {
              values: this.blins.filter(blin => 'PROC' === p.data.appropriation
                ? blin.match(/00/)
                : blin.match(/BA[1-9]/) )
            }
          )
          ,
          valueSetter: p => {
            p.data.blin = p.newValue;

            autovalues.programElement(p.newValue, p.data.item ? p.data.item : '').then(val => {
              p.data.programElement = val;
              p.node.setDataValue('programElement', p.data.programElement);
              saveIfPossible(p);
            });
            return true;
          },
          suppressSizeToFit: true
        },
        {
          headerName: 'Item',
          headerTooltip: 'Item',
          filter: 'agTextColumnFilter',
          field: 'item',
          width: 90,
          menuTabs: this.menuTabs,
          cellClass: ['ag-cell-light-grey'],
          editable: p => (!p.data.id),
          valueSetter: p => {
            p.data.item = p.newValue;
            p.data.initial = 0;

            // setting the item number could change our programElement
            if (p.data.blin) {
              autovalues.programElement(p.data.blin, p.data.item ? p.data.item : '').then(val => {
                p.data.programElement = val;
                saveIfPossible(p);
              });
            }
            return true;
          },
          suppressSizeToFit: true
        },
        {
          headerName: 'OA',
          headerTooltip: 'OA',
          filter: 'agTextColumnFilter',
          field: 'opAgency',
          width: 80,
          menuTabs: this.menuTabs,
          cellClass: ['ag-cell-light-grey', 'text-center'],
          editable: p => (!p.data.id),
          cellEditor: 'agRichSelectCellEditor',
          cellEditorParams: params => ({ values: this.opAgencies }),
          valueSetter: p => {
            p.data.opAgency = p.newValue;
            saveIfPossible(p);
            return true;
          },
          suppressSizeToFit: true
        },
        {
          headerName: 'PE',
          headerTooltip: 'PE',
          filter: 'agTextColumnFilter',
          field: 'programElement',
          width: 100,
          menuTabs: this.menuTabs,
          cellClass: ['ag-cell-light-grey', 'text-center'],
          suppressSizeToFit: true
        },
        {
          headerName: 'Initial Funds',
          headerTooltip: 'Initial Funds',
          headerValueGetter: params =>  ( this.selectedexe ? 'PB' + (this.selectedexe.fy - 2000 ) : 'Initial Funds' ),
          field: 'initial',
          valueFormatter: params => this.currencyFormatter(params),
          width: 104,
          suppressSorting: false,
          suppressMenu: true,
          cellClass: ['ag-cell-light-green', 'text-right'],
          suppressSizeToFit: true
        },
        {
          headerName: 'CRA',
          headerTooltip: 'CRA',
          field: 'craTotal',
          valueFormatter: params => this.currencyFormatter(params),
          width: 104,
          suppressSorting: false,
          suppressMenu: true,
          cellClass: ['ag-cell-white', 'text-right'],
          suppressSizeToFit: true
        },
        {
          headerName: 'Realigned',
          headerTooltip: 'Realigned',
          field: 'realignedTotal',
          valueFormatter: params => this.currencyFormatter(params),
          width: 104,
          suppressSorting: false,
          suppressMenu: true,
          cellClass: ['ag-cell-white', 'text-right'],
          suppressSizeToFit: true
        },
        {
          headerName: 'APPN Action',
          headerTooltip: 'Appropriation Action',
          field: 'apprTotal',
          valueFormatter: params => this.currencyFormatter(params),
          width: 104,
          suppressSorting: false,
          suppressMenu: true,
          cellClass: ['ag-cell-white', 'text-right'],
          suppressSizeToFit: true
        },
        {
          headerName: 'OUSD(C) Actions',
          headerTooltip: 'OUSD(C) Actions',
          field: 'ousdcTotal',
          valueFormatter: params => this.currencyFormatter(params),
          width: 115,
          suppressSorting: false,
          suppressMenu: true,
          cellClass: ['ag-cell-white', 'text-right'],
          suppressSizeToFit: true
        },
        {
          headerName: 'BTR',
          headerTooltip: 'BTR',
          field: 'btrTotal',
          valueFormatter: params => this.currencyFormatter(params),
          width: 104,
          suppressSorting: false,
          suppressMenu: true,
          cellClass: ['ag-cell-white', 'text-right'],
          suppressSizeToFit: true
        },
        {
          headerName: 'TOA',
          headerTooltip: 'TOA',
          field: 'toa',
          valueFormatter: params =>  this.currencyFormatter(params),
          width: 104,
          suppressSorting: false,
          suppressMenu: true,
          cellClass: ['ag-cell-dark-green', 'text-right'],
          suppressSizeToFit: true
        },
        {
          headerName: 'Released',
          headerTooltip: 'Released',
          field: 'released',
          valueFormatter: params => this.currencyFormatter(params),
          width: 104,
          suppressSorting: false,
          suppressMenu: true,
          cellClass: ['ag-cell-dark-green', 'text-right'],
          suppressSizeToFit: true
        },
        {
          headerName: 'Withhold',
          headerTooltip: 'Withhold',
          field: 'withheld',
          valueFormatter: params => this.currencyFormatter(params),
          width: 104,
          suppressSorting: false,
          suppressMenu: true,
          cellClass: ['ag-cell-dark-green', 'text-right'],
          suppressSizeToFit: true
        }
      ]
    };
  }

  ngOnInit() {
    this.usersvc.getCurrentUser().subscribe(deets => {
      forkJoin([
        this.exesvc.getAll(),
      ]).subscribe(data => {
        this.exephases = data[0].result;
        if (this.exephases.length > 0) {
          if (SessionUtil.get('execution')) {
            this.selectedexe = this.exephases.find(e => e.fy === SessionUtil.get('execution').fy);
          } else {
            this.selectedexe = this.exephases[0];
            SessionUtil.set('execution', this.selectedexe);
          }
          this.fetchLines();
        }
      });
    });
  }

  fetchLines() {
    if (!this.selectedexe) {
      this.exelines = [];
      this.agOptions.api.showNoRowsOverlay();
      return;
    }

    this.agOptions.api.showLoadingOverlay();
    forkJoin([
      this.exesvc.getExecutionLinesByPhase(this.selectedexe.id),
      this.exesvc.hasAppropriation(this.selectedexe.id)
    ]).subscribe(data => {
      this.exelines = data[0].result;
      if (0 === this.exelines.length) {
        this.agOptions.api.showNoRowsOverlay();
      } else {
        this.agOptions.api.hideOverlay();
      }

      this.refreshFilterDropdowns();
      this.hasReleased = data[0].result.some(el => el.released > 0);
      this.hasAppropriation = data[1].result;

      this.agGrid.api.sizeColumnsToFit();
      this.agGrid.api.refreshHeader();
    });
    SessionUtil.set('execution', this.selectedexe);
  }

  @HostListener('window:resize', ['$event'])
  getScreenSize(event?) {
    this.sizeColumnsToFit(this.agGrid);
  }

  sizeColumnsToFit(params) {
    let totalColsWidth = 0;
    const allColumns = params.columnApi.getAllDisplayedColumns();
    for (let i = 0; i < allColumns.length; i++) {
      const column = allColumns[i];
      totalColsWidth += column.actualWidth;
    }
    if (totalColsWidth > window.innerWidth) {
      totalColsWidth = window.innerWidth;
      totalColsWidth -= 55;
    } else {
      totalColsWidth += 22.5; // this an additional width to cover for the vertical button on the right
    }

    this.containerStyle = {width: totalColsWidth + 'px'};
  }

  currencyFormatter(value) {
    if (isNaN(value.value)) {
      value.value = 0;
    }
    const usdFormate = new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    });
    return usdFormate.format(value.value);
  }

  refreshFilterDropdowns() {
    const apprset: Set<string> = new Set<string>();
    const itemset: Set<string> = new Set<string>();
    const blinset: Set<string> = new Set<string>();
    const agencyset: Set<string> = new Set<string>();
    const programset: Set<string> = new Set<string>();
    this.exelines.forEach((x: ExecutionLine) => {
      if (x.programName) {
        programset.add(x.programName);
      }

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

    this.appropriations = [];
    apprset.forEach(s => {
      this.appropriations.push(s);
    });

    this.items = [];
    itemset.forEach(s => {
      this.items.push(s);
    });

    this.blins = [];
    blinset.forEach(s => {
      this.blins.push(s);
    });

    this.opAgencies = [];
    agencyset.forEach(s => {
      this.opAgencies.push(s);
    });

    this.programs = [];
    programset.forEach(s => {
      this.programs.push(s);
    });
    this.programs.push( 'Other');

    this.appropriations.sort();
    this.items.sort();
    this.blins.sort();
    this.opAgencies.sort();
    this.programs.sort((a, b) => {
      if ('Other' === a) {
        return -1;
      } else if ('Other' === b) {
        return 1;
      }

      return (a === b ? 0 : a < b ? -1 : 1);
    });
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
    window.addEventListener('resize', () => {
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
    const selectedValue = Number(event.target.value);
    this.agGrid.api.paginationSetPageSize(selectedValue);
    this.agGrid.api.sizeColumnsToFit();
  }
}
