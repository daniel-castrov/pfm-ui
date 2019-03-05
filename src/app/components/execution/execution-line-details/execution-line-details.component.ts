import {Component, OnInit, ViewChild, ViewEncapsulation} from '@angular/core';
import {Execution, ExecutionDropDown, ExecutionEvent, ExecutionService, ProgramsService} from '../../../generated';
import {ActivatedRoute, UrlSegment} from '../../../../../node_modules/@angular/router';
import {forkJoin} from '../../../../../node_modules/rxjs/observable/forkJoin';
import {ExecutionLineWrapper} from '../model/execution-line-wrapper';
import {GridOptions} from 'ag-grid';
import {AgGridNg2} from 'ag-grid-angular';

import {TransferFromToDetailsCellRendererComponent} from '../transfer-from-to-details-cell-renderer/transfer-from-to-details-cell-renderer.component'

@Component({
  selector: 'app-execution-line-details',
  templateUrl: './execution-line-details.component.html',
  styleUrls: ['./execution-line-details.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class ExecutionLineDetailsComponent implements OnInit {

  @ViewChild("agGrid") private agGrid: AgGridNg2;

  private current: ExecutionLineWrapper;
  private phase: Execution;
  private eventlist: EventItem[];
  private dropdowns: ExecutionDropDown[] = [];
  private programIdNameLkp: Map<string, string> = new Map<string, string>();
  
  private agOptions: GridOptions;

  constructor(private exesvc: ExecutionService, private progsvc: ProgramsService,
    private route: ActivatedRoute) {
    
    var agcomps: any = {
      fromto: TransferFromToDetailsCellRendererComponent
    };
    
    var my: ExecutionLineDetailsComponent = this;

    this.agOptions = <GridOptions>{
      enableSorting: true,
      enableFilter: true,
      gridAutoHeight: true,
      pagination: true,
      paginationPageSize: 30,
      suppressPaginationPanel: true,
      frameworkComponents: agcomps,
      context: {},
      columnDefs: [
        {
          headerName: "Date",
          filter: 'agDateColumnFilter',
          cellClass: ['ag-cell-light-grey', 'ag-clickable'],
          field: 'date'
        },
        {
          headerName: "Category",
          filter: 'agDateColumnFilter',
          cellClass: ['ag-cell-light-grey', 'ag-clickable'],
          field: 'category'
        },
        {
          headerName: "Type",
          filter: 'agDateColumnFilter',
          cellClass: ['ag-cell-light-grey', 'ag-clickable'],
          field: 'type'
        },
        {
          headerName: "Tag",
          filter: 'agTextColumnFilter',
          cellClass: ['ag-cell-light-grey', 'ag-clickable'],
          field: 'tag'
        },
        {
          headerName: "Transfer To/From",
          cellClass: ['ag-cell-light-grey', 'ag-clickable'],
          field: 'event',
          cellRenderer: 'fromto'
        },
        {
          headerName: "Amount",
          filter: 'agNumberColumnFilter',
          cellClass: ['ag-cell-light-grey', 'ag-clickable', 'text-right'],
          type: 'numericColumn',
          field: 'amt',
          valueFormatter: my.currencyFormatter
        },
        {
          headerName: "Notes",
          filter: 'agTextColumnFilter',
          cellClass: ['ag-cell-light-grey', 'ag-clickable'],
          field: 'reason',
          hide: true
        },
        {
          filter: 'agDateColumnFilter',
          headerName: "User",
          cellClass: ['ag-cell-light-grey', 'ag-clickable'],
          field: 'user'
        },
      ]
    };
  }

  currencyFormatter(value) {
    if (isNaN(value.value)) {
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


  ngOnInit() {
    var my: ExecutionLineDetailsComponent = this;
    this.route.url.subscribe((segments: UrlSegment[]) => {
      var exelineid = segments[segments.length - 1].path;

      forkJoin([
        my.exesvc.getExecutionLineById(exelineid),
        my.exesvc.getExecutionDropdowns(),
        my.exesvc.getExecutionEventsByExecutionLine(exelineid),
        my.progsvc.getIdNameMap(),
      ]).subscribe(data => {
        my.current = {
          line: data[0].result
        }

        my.exesvc.getById(my.current.line.phaseId).subscribe(data2 => { 
          my.phase = data2.result;
          my.agOptions.context = {
            line: my.current.line,
            phase: my.phase,
            programIdNameLkp: my.programIdNameLkp
          };
          my.agOptions.api.redrawRows();
        });

        my.dropdowns = data[1].result;

        var evarr: EventItem[] = [];
        data[2].result.forEach((x: ExecutionEvent) => {
          var isfrom: boolean = (my.current.line.id === x.value.fromId);
          var fromissource: boolean = (x.value.fromIsSource);
          var amt: number = 0;
          var tolkp: Map<string, number> = new Map<string, number>();
          var totalto: number = 0;

          Object.getOwnPropertyNames(x.value.toIdAmtLkp).forEach(key => {
            tolkp.set(key, x.value.toIdAmtLkp[key]);
            totalto += x.value.toIdAmtLkp[key];
          });
          if (tolkp.has(my.current.line.id)) {
            amt = tolkp.get(my.current.line.id);
          }
          else {
            amt = totalto;
          }

          console.log(x);

          evarr.push({
            date: new Date(x.timestamp.year, x.timestamp.monthValue-1, x.timestamp.dayOfMonth),
            category: x.eventType,
            type: my.dropdowns.filter(dd => dd.subtype === x.value.type)[0].name,
            amt: amt,
            user: x.userCN,
            event: x,
            reason: x.value.reason,
            tag: x.value.other
          });
        });

        my.eventlist = evarr;

        Object.getOwnPropertyNames(data[3].result).forEach(id => {
          my.programIdNameLkp.set(id, data[3].result[id]);
        });
      });
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

interface EventItem {
  date: Date,
  category: string,
  type: string,
  amt: number,
  user: string,
  event: ExecutionEvent,
  reason: string,
  tag:string
}
