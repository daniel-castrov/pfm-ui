import {Component, Input, OnInit, ViewChild, ViewEncapsulation} from '@angular/core'
import {Router} from '@angular/router'
import {Execution, ExecutionLine, ExecutionService, MyDetailsService} from '../../../generated'
import {ProgramsService} from '../../../generated/api/programs.service';
import {ExecutionLineWrapper} from '../model/execution-line-wrapper'
import {ExecutionLineFilter} from '../model/execution-line-filter'
import {ExecutionTableValidator} from '../model/execution-table-validator'
import {GridOptions} from 'ag-grid';
import {AgGridNg2} from 'ag-grid-angular';
import {ProgramCellRendererComponent} from '../../renderers/program-cell-renderer/program-cell-renderer.component';
import {EventDetailsCellRendererComponent} from '../../renderers/event-details-cell-renderer/event-details-cell-renderer.component';
import {DeleteRenderer} from "../../renderers/delete-renderer/delete-renderer.component";

@Component({
  selector: 'app-execution-line-table',
  templateUrl: './execution-line-table.component.html',
  styleUrls: ['./execution-line-table.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class ExecutionLineTableComponent implements OnInit {
  @ViewChild("agGrid") private agGrid: AgGridNg2;
  private _phase: Execution;
  @Input() private showAddProgramButton: boolean = true;
  @Input() private fromIsSource: boolean;
  private _exelinefilter: ExecutionLineFilter;
  private _exeprogramfilter: ExecutionLineFilter;
  @Input() exevalidator: ExecutionTableValidator = function (x: ExecutionLineWrapper[]): boolean[] {
    var okays: boolean[] = [];
    x.forEach((el: ExecutionLineWrapper) => {
      //console.log(el.line.toa + '-' + el.line.withheld + '-' + el.line.released + '>=' + el.amt + '? ' + (el.line.toa - el.line.withheld - el.line.released >= el.amt));
      okays.push((el.line.toa ? el.line.toa - el.line.withheld - el.line.released >= el.amt : true));
    });
    return okays;
  };
  tableok: boolean = false;
  private elIdNameLkp: Map<string, ELDisplay> = new Map<string, ELDisplay>();
  private agOptions: GridOptions;
  private availablePrograms: any[] = [];
  private lineSelected = null;
  private totalsrow: ExecutionLineWrapper;

  private tmpdata: ExecutionLineWrapper[];

  @Input() set exelinefilter(x: ExecutionLineFilter) {
    this._exelinefilter = x;
    this.setAvailablePrograms();
  }

  get exelinefilter(): ExecutionLineFilter {
    return this._exelinefilter;
  }

  @Input() set exeprogramfilter(x: ExecutionLineFilter) {
    this._exeprogramfilter = x;
    this.setAvailablePrograms();
  }

  get exeprogramfilter(): ExecutionLineFilter {
    return this._exeprogramfilter;
  }

  @Input() set phase(p: Execution) {
    this._phase = p;
    if (p) {
      this.exesvc.getExecutionLinesByPhase(this.phase.id).subscribe(d2 => {
        d2.result
          .filter(y => (this.exeprogramfilter ? this.exeprogramfilter(y) : y.released > 0))
          .forEach(el => {
            this.elIdNameLkp.set(el.id, {
              line: el,
              display: el.appropriation + '/' + el.blin + '/' + el.item + '/' + el.opAgency
            });
          });

        this.setAvailablePrograms();
        if (this.agOptions) {
          this.agOptions.api.redrawRows();
        }
      });
    }
  }

  get phase(): Execution {
    return this._phase;
  }

  @Input() set updatelines(newdata: ExecutionLineWrapper[]) {
    if (this.agOptions && this.agOptions.api) {
      // agOptions has been initted, so we can use newdata directly
      this.resetTable(newdata);
    }
    else {
      // agOptions not yet ready, so save this data for when it is
      this.tmpdata = newdata;
    }
  }

  get updatelines(): ExecutionLineWrapper[] {
    var lines: ExecutionLineWrapper[] = [];
    this.agOptions.api.forEachNodeAfterFilter(rn => {
      if (rn.data.amt) {
        lines.push(rn.data);
      }
    });

    return lines;
  }

  resetTable(newdata: ExecutionLineWrapper[]) {
    this.agOptions.api.setRowData(newdata);
    this.refreshpins();
    this.setAvailablePrograms();
    this.agOptions.api.refreshCells();
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

  refreshpins() {
    var dopinned: boolean = false;
    this.agOptions.api.forEachNodeAfterFilter(rn => {
      if (rn.data.amt && rn.data.amt > 0) {
        dopinned = true;
      }
    });

    if (dopinned) {
      this.totalsrow = {
        line: { programName: 'totals-row' },
        amt: this.total()
      };
      this.agOptions.api.setPinnedBottomRowData([this.totalsrow]);
    }
    else {
      this.agOptions.api.setPinnedBottomRowData([]);
      delete this.totalsrow;
    }

    this.recheckValidity();
  }

  constructor(private exesvc: ExecutionService, private usersvc: MyDetailsService,
    private progsvc: ProgramsService, private router: Router) {

    var agcomps: any = {
      programCellRendererComponent: ProgramCellRendererComponent,
      eventDetailsCellRendererComponent: EventDetailsCellRendererComponent,
      deleter: DeleteRenderer
    };

    var my: ExecutionLineTableComponent = this;

    var programSetter = function (params): boolean {
      if (params.newValue) {
        var programName: string = params.newValue;
        var elChoices = my.getLineChoices(programName);
        if (1 == elChoices.length) {
          params.data.line = my.elIdNameLkp.get( elChoices[0] ).line;
          params.data.amt = 0;
        }
        else {
          params.data.line = { programName: programName };
          params.data.amt = 0;
        }

        return true;
      }

      return false;
    }

    var my: ExecutionLineTableComponent = this;
    var amtSetter = function (params): boolean {
      params.data.amt = Number.parseFloat(params.newValue);
      my.refreshpins();
      return true;
    }

    var linesetter = function (params): boolean {
      if (params.newValue && my.elIdNameLkp.has( params.newValue )) {
        params.data.line = my.elIdNameLkp.get(params.newValue).line;
        return true;
      }
      return false;
    }

    var linecellfilter = function (filter: string, cellval: any, filtertext: string): boolean {
      //console.log('into linecellfilter: '+cellval);
      var elname: string = '';
      my.agOptions.api.forEachNode(rn => {
        if (rn.data.line.id === cellval) {
          elname = rn.data.line.appropriation + '/' + rn.data.line.blin + '/' + rn.data.line.item + '/' + rn.data.line.opAgency;
        }
      });

      elname = elname.toLocaleLowerCase();
      switch (filter) {
        case 'equals':
          return elname === filtertext;
        case 'notEqual':
          return elname !== filtertext;
        case 'startsWith':
          return elname.startsWith(filtertext);
        case 'endsWith':
          return elname.endsWith(filtertext);
        case 'contains':
          return elname.indexOf(filtertext) > -1;
        case 'notContains':
          return elname.indexOf(filtertext) < 0;
        default:
          console.warn('some new filter? ' + filter);
      };

      return false;
    }

    this.agOptions = <GridOptions>{
      enableSorting: true,
      enableFilter: true,
      gridAutoHeight: true,
      pagination: true,
      paginationPageSize: 30,
      suppressPaginationPanel: true,
      frameworkComponents: agcomps,
      onFilterModified: ev => {
        my.refreshpins();
      },
      context: {
        parentComponent: this,
        deleteHidden: false
      },
      columnDefs: [
        {
          headerName: "Program",
          filter: 'agTextColumnFilter',
          cellClass: ['ag-cell-light-grey', 'ag-clickable'],
          valueFormatter: params => ( params.data.line.programName
            ? params.data.line.programName
            : 'Please choose a Program'),
          field: 'line.programName',
          valueSetter: programSetter,
          pinnedRowCellRenderer: params=>''
        },
        {
          headerName: 'Execution Line',
          filter: 'agTextColumnFilter',
          filterParams: {
            textCustomComparator: linecellfilter
          },
          field: 'line.id',
          valueFormatter: params => (params.data.line.appropriation && my.elIdNameLkp.has(params.data.line.id)
            ? my.elIdNameLkp.get(params.data.line.id).display
            : params.data.line.programName ? 'Select an Execution Line' : 'Select a Program first'),
          valueSetter: linesetter,
          cellClass: ['ag-cell-light-grey'],
          pinnedRowCellRenderer: params => ''
        },
        {
          headerName: 'TOA',
          filter: 'agNumberColumnFilter',
          field: 'line.toa',
          type: 'numericColumn',
          width: 92,
          cellClass: ['ag-cell-light-grey', 'text-right'],
          valueFormatter: my.currencyFormatter,
          pinnedRowCellRenderer: p => ''
        },
        {
          headerName: 'Released',
          filter: 'agNumberColumnFilter',
          field: 'line.released',
          type: 'numericColumn',
          width: 92,
          cellClass: ['ag-cell-light-grey', 'text-right'],
          valueFormatter: my.currencyFormatter,
          pinnedRowCellRenderer: p => ''
        },
        {
          headerName: 'Withheld',
          filter: 'agNumberColumnFilter',
          type: 'numericColumn',
          field: 'line.withheld',
          width: 92,
          cellClassRules: {
            'ag-cell-light-grey': p=>true,
            'text-right': p=>true,
            'ag-cell-footer-sum': p => (p.data === this.totalsrow),
            'font-weight-bold': p => (p.data === this.totalsrow)
          },
          valueFormatter: my.currencyFormatter,
          pinnedRowCellRenderer: params => 'Total'
        },
        {
          headerName: 'Amount',
          editable: p => (p.data !== my.totalsrow),
          filter: 'agNumberColumnFilter',
          type: 'numericColumn',
          field: 'amt',
          valueSetter: amtSetter,
          width: 92,
          cellClassRules: {
            'ag-cell-edit': params => my.validateOneRow(params.data),
            'text-right': true,
            'ag-cell-footer-sum': p => (p.data === this.totalsrow),
            'ag-cell-red': params => !my.validateOneRow(params.data),
            'font-weight-bold': p => (p.data === this.totalsrow),
          },
          pinnedRowCellRenderer: p => {
            var val = my.currencyFormatter(p);
            if (!my.tableok) {
              return '<span style="color: red;">' + val + '</span>';
            }
            return val;
          },
          valueFormatter: my.currencyFormatter
        },
        {
          headerName: 'Remove',
          filter: 'agNumberColumnFilter',
          field: 'amt',
          width: 35,
          cellRenderer: 'deleter',
          cellClass: ['ag-cell-light-grey'],
          pinnedRowCellRenderer: p => ''
        }
      ]
    };
  }

  validateOneRow(row): boolean {
    var ok = this.exevalidator([row], false)[0];
    return ok;
  }

  ngOnInit() {
  }

  addrow() {
    this.availablePrograms.splice(this.availablePrograms.indexOf(this.lineSelected), 1);
    this.agOptions.api.updateRowData({
      add: [{
        line: this.lineSelected.value.line,
        amt: 0
      }]
    });
    this.lineSelected = null;
    this.refreshpins();
  }

  delete(rowIndex, data) {
    this.agOptions.api.updateRowData({ remove: [data] });
    this.refreshpins();
  }

  getLineChoices(programname): string[] {
    var existingEls: Set<string> = new Set<string>();
    if (this.agOptions && this.agOptions.api) {
      this.agOptions.api.forEachNode(rownode => {
        if (rownode.data.line.id) {
          existingEls.add(rownode.data.line.id);
        }
      });
    }

    var rets: string[] = [];
    this.elIdNameLkp.forEach((eld, elid) => {
      if (eld.line.programName === programname &&
        (this.exelinefilter ? this.exelinefilter(eld.line) : true) &&
        !existingEls.has(elid)) {
        rets.push(elid);
      }
    });

    return rets;
  }

  total(): number {
    var tot: number = 0;
    this.agOptions.api.forEachNodeAfterFilter(rn => {
      if (rn.data.amt) {
        tot += rn.data.amt;
      }
    });
    return tot;
  }

  recheckValidity() {
    var lines: ExecutionLineWrapper[] = [];
    this.agOptions.api.forEachNodeAfterFilter(rn => {
      if (rn.data.line.id && this.elIdNameLkp.has(rn.data.line.id)
        && rn.data.amt && 0 !== rn.data.amt) {
        lines.push(rn.data);
      }
    });

    var failure: boolean = false;
    if (0 === lines.length) {
      failure = true;
    }
    else {
      this.exevalidator(lines, true).forEach(x => {
        if (!x) {
          failure = true;
        }
      });
    }

    this.tableok = !failure;
    if (this.totalsrow) {
      var newtots: ExecutionLineWrapper = Object.assign({}, this.totalsrow);
      this.totalsrow = newtots;
      this.agOptions.api.setPinnedBottomRowData([this.totalsrow]);
    }
    this.agGrid.api.refreshCells(); // need to update CSS classes
  }

  clearGrid(){
    this.agGrid.api.setRowData([])
  }

  setAvailablePrograms(fromIsSource?: boolean) {
    this.fromIsSource = fromIsSource === undefined? this.fromIsSource : fromIsSource;
    this.availablePrograms.splice(0, this.availablePrograms.length);
    this.elIdNameLkp.forEach(el => {
      if (!this.fromIsSource){
        if (el.line.released > 0) {
          this.availablePrograms.push({
            display: el.line.programName + ' ' + el.display,
            value: el
          });
        }
      }else {
        this.availablePrograms.push({
          display: el.line.programName + ' ' + el.display,
          value: el
        });
      }
     });
    if (this._exelinefilter) {
      this.availablePrograms = this.availablePrograms.filter( ap => this._exelinefilter(ap.value.line));
    }
  }

  onGridReady(params) {
    if (this.tmpdata) {
      // we have data to load from earlier, so load it now
      this.resetTable( this.tmpdata );
      delete this.tmpdata;
    }

    setTimeout(() => {
      params.api.sizeColumnsToFit();
      this.recheckValidity();
    }, 500);
    window.addEventListener("resize", function() {
      setTimeout(() => {
        params.api.sizeColumnsToFit();
      });
    });
  }
}

interface ELDisplay {
  line: ExecutionLine;
  display: string
}
