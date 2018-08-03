import { Component, OnInit, ViewChild } from '@angular/core'

// Other Components
import { HeaderComponent } from '../../../components/header/header.component'
import { Router } from '@angular/router'
import { ExecutionService, Execution, MyDetailsService, Program, ExecutionLine } from '../../../generated'
import { GlobalsService} from '../../../services/globals.service'
import { forkJoin } from 'rxjs/observable/forkJoin';
import { ProgramsService } from '../../../generated/api/programs.service';
import { GridOptions } from 'ag-grid';
import { AgGridNg2 } from 'ag-grid-angular';
import { ProgramCellRendererComponent } from '../../renderers/program-cell-renderer/program-cell-renderer.component';

@Component({
  selector: 'funds-update',
  templateUrl: './funds-update.component.html',
  styleUrls: ['./funds-update.component.scss']
})

export class FundsUpdateComponent implements OnInit {
  @ViewChild(HeaderComponent) header;
  @ViewChild("agGrid") private agGrid: AgGridNg2;

  private exephases: Execution[];
  private selectedexe: Execution;
  private exelines: ExecutionLine[] = [];
  private programs: Map<string, string> = new Map<string, string>();
  private appropriations: string[] = [];
  private blins: string[] = [];
  private items: string[] = [];
  private opAgencies: string[] = [];
  private selectedRow: number = -1;
  private mrid: string;
  private appropriation: string;
  private blin: string;
  private item: string;
  private opAgency: string;
  private funds: number;
  private menuTabs = ['filterMenuTab'];

  private agOptions: GridOptions;

  constructor(private exesvc: ExecutionService, private usersvc: MyDetailsService,
    private progsvc: ProgramsService, private router: Router) {
    var my: FundsUpdateComponent = this;

    var agcomps:any = {
      programCellRendererComponent: ProgramCellRendererComponent
    };

    my.progsvc.getIdNameMap().subscribe(data => {
      Object.getOwnPropertyNames(data.result).forEach(mrId => {
        my.programs.set(mrId, data.result[mrId]);
      });
    });

    var namesorter = function (mrId1, mrId2) {
      var name1 = my.programs.get(mrId1);
      var name2 = my.programs.get(mrId2);
      if (name1 === name2){
        return 0;
      }

      return (name1 < name2 ? -1 : 1);
    }

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
        route: '/update-program-execution'
      },
      columnDefs: [
        {
          headerName: "Program",
          filter: 'agTextColumnFilter',
          cellRenderer: 'programCellRendererComponent',
          comparator: namesorter,
          menuTabs: this.menuTabs,
          cellClass: ['ag-cell-light-grey','ag-clickable'],
          valueGetter: params => { return params.data.mrId; }
        },
        {
          headerName: 'Appr.',
          filter: 'agTextColumnFilter',
          field: 'appropriation',
          width: 92,
          menuTabs: this.menuTabs,
          cellClass: ['ag-cell-light-grey']
        },
        {
          headerName: 'Budget',
          filter: 'agTextColumnFilter',
          field: 'blin',
          width: 92,
          menuTabs: this.menuTabs,
          cellClass: ['ag-cell-light-grey']
        },
        {
          headerName: 'Item',
          filter: 'agTextColumnFilter',
          field: 'item',
          width: 92,
          menuTabs: this.menuTabs,
          cellClass: ['ag-cell-light-grey']
        },
        {
          headerName: 'opAgency',
          filter: 'agTextColumnFilter',
          field: 'opAgency',
          width: 92,
          menuTabs: this.menuTabs,
          cellClass: ['ag-cell-light-grey','text-center']
        },
        {
          headerName: 'Initial Funds',
          field: 'initial',
          valueFormatter: params => {return this.currencyFormatter(params)},
          width: 92,
          suppressSorting: false,
          suppressMenu: true,
          cellClass: ['ag-cell-light-green','text-right']
        },
        {
          headerName: 'CRA',
          field: 'craTotal',
          valueFormatter: params => {return this.currencyFormatter(params)},
          width: 92,
          suppressSorting: false,
          suppressMenu: true,
          cellClass: ['ag-cell-white','text-right']
        },
        {
          headerName: 'Realigned',
          field: 'realignedTotal',
          valueFormatter: params => {return this.currencyFormatter(params)},
          width: 92,
          suppressSorting: false,
          suppressMenu: true,
          cellClass: ['ag-cell-white','text-right']
        },
        {
          headerName: 'Appr. Actions',
          field: 'apprTotal',
          valueFormatter: params => {return this.currencyFormatter(params)},
          width: 92,
          suppressSorting: false,
          suppressMenu: true,
          cellClass: ['ag-cell-white','text-right']
        },
        {
          headerName: 'OUSD(C) Actions',
          field: 'ousdcTotal',
          valueFormatter: params => {return this.currencyFormatter(params)},
          width: 92,
          suppressSorting: false,
          suppressMenu: true,
          cellClass: ['ag-cell-white','text-right']
        },
        {
          headerName: 'BTR',
          field: 'btrTotal',
          valueFormatter: params => {return this.currencyFormatter(params)},
          width: 92,
          suppressSorting: false,
          suppressMenu: true,
          cellClass: ['ag-cell-white','text-right']
        },
        {
          headerName: 'Withheld',
          field: 'withheld',
          valueFormatter: params => {return this.currencyFormatter(params)},
          width: 92,
          suppressSorting: false,
          suppressMenu: true,
          cellClass: ['ag-cell-dark-green','text-right']
        },
        {
          headerName: 'TOA',
          field: 'toa',
          valueFormatter: params => {return this.currencyFormatter(params)},
          width: 92,
          suppressSorting: false,
          suppressMenu: true,
          cellClass: ['ag-cell-dark-green','text-right']
        },
        {
          headerName: 'Released',
          field: 'released',
          valueFormatter: params => {return this.currencyFormatter(params)},
          width: 92,
          suppressSorting: false,
          suppressMenu: true,
          cellClass: ['ag-cell-dark-green','text-right']
        },
      ]
    };
  }

  ngOnInit() {
    var my: FundsUpdateComponent = this;
    my.usersvc.getCurrentUser().subscribe(deets => {
      forkJoin([
        my.progsvc.getIdNameMap(),
        //my.exesvc.getByCommunity(deets.result.currentCommunityId, 'OPEN'),
        my.exesvc.getByCommunityId(deets.result.currentCommunityId, 'CREATED')
      ]).subscribe(data => {
        var lookup: {id:string, name:string}[] = [];
        Object.getOwnPropertyNames(data[0].result).forEach(mrid => {
          lookup.push( {id:mrid, name: data[0].result[mrid]})
        });


        lookup.sort((a, b) => {
          if (a.name === b.name) {
            return 0;
          }
          return (a.name < b.name ? -1 : 1);
        });

        my.programs = new Map<string, string>();
        for (var i = 0; i < lookup.length; i++ ){
          my.programs.set(lookup[i].id, lookup[i].name);
        }

        my.exephases = data[1].result;
        my.selectedexe = my.exephases[0];
        my.fetchLines();
        this.agGrid.api.sizeColumnsToFit();
      });
    });
  }

  fetchLines() {
    var my: FundsUpdateComponent = this;
    my.exesvc.getExecutionLinesByPhase(my.selectedexe.id).subscribe(data => {
      my.exelines = data.result;
      this.refreshFilterDropdowns();
    });
  }

  currencyFormatter(value) {
    if(isNaN(value.value)) {
      value.value = 0;
    }
    var usdFormate = new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0
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
    var newline: ExecutionLine = {
      appropriation: this.appropriation,
      blin: this.blin,
      item: this.item,
      opAgency: this.opAgency,
      mrId: this.mrid,
      toa: this.funds,
      initial: this.funds
    };

    this.exesvc.createExecutionLine(this.selectedexe.id, newline).subscribe(data => {
      newline.id = data.result;
      this.agOptions.api.paginationGoToLastPage();
      this.agOptions.api.addItems([newline]);
      this.refreshFilterDropdowns();
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
}
