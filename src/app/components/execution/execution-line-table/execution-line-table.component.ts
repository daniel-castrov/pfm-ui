import { Component, OnInit, ViewChild, Input, ViewEncapsulation } from '@angular/core'

// Other Components
import { HeaderComponent } from '../../header/header.component'
import { Router } from '@angular/router'
import { ExecutionService, Execution, MyDetailsService, Program, ExecutionLine } from '../../../generated'
import { forkJoin } from 'rxjs/observable/forkJoin';
import { ProgramsService } from '../../../generated/api/programs.service';
import { ExecutionLineWrapper } from '../model/execution-line-wrapper'
import { ExecutionLineFilter } from '../model/execution-line-filter'
import { ExecutionTableValidator } from '../model/execution-table-validator'
import { GridOptions, RowNode } from 'ag-grid';
import { AgGridNg2 } from 'ag-grid-angular';
import { ProgramCellRendererComponent } from '../../renderers/program-cell-renderer/program-cell-renderer.component';
import { EventDetailsCellRendererComponent } from '../../renderers/event-details-cell-renderer/event-details-cell-renderer.component';
import { DeleteRenderer } from "../../renderers/delete-renderer/delete-renderer.component";

@Component({
  selector: 'app-execution-line-table',
  templateUrl: './execution-line-table.component.html',
  styleUrls: ['./execution-line-table.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class ExecutionLineTableComponent implements OnInit {
  @ViewChild(HeaderComponent) header;
  @ViewChild("agGrid") private agGrid: AgGridNg2;
  private _phase: Execution;
  @Input() private showAddProgramButton: boolean = true;
  @Input() private sourceOrTarget: string = 'to select target programs';
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
  private programIdNameLkp: Map<string, string> = new Map<string, string>();
  private elIdNameLkp: Map<string, ELDisplay> = new Map<string, ELDisplay>();
  private agOptions: GridOptions;
  private availablePrograms: {}[] = [];

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
      var my: ExecutionLineTableComponent = this;
      my.exesvc.getExecutionLinesByPhase(my.phase.id).subscribe(d2 => {
        d2.result
          .filter(y => (this.exeprogramfilter ? this.exeprogramfilter(y) : y.released > 0))
          .forEach(el => {
            my.elIdNameLkp.set(el.id, {
              line: el,
              display: el.appropriation + '/' + el.blin + '/' + el.item + '/' + el.opAgency
            });
          });
        
        my.setAvailablePrograms();
      });
    }
  }

  get phase(): Execution {
    return this._phase;
  }

  @Input() set updatelines(newdata: ExecutionLineWrapper[]) {
    console.log( 'into updatelines')
    if (this.agOptions && this.agOptions.api) {
      console.log( 'agOptions has been initted')
      this.agOptions.api.setRowData(newdata);
      this.agOptions.api.refreshCells();
      this.refreshpins();
      this.recheckValidity();
    }
    else {
      console.log('agOptions has NOT been initted...storing data for later')
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

  refreshpins() {
    //console.log('pins: '+this.agOptions.api.getDisplayedRowCount());
    var dopinned: boolean = false;
    this.agOptions.api.forEachNodeAfterFilter(rn => { 
      if (rn.data.amt && rn.data.amt > 0) {
        dopinned = true;
      }
    });

    if( dopinned ){
      this.agOptions.api.setPinnedBottomRowData([{
        line: {},
        amt: this.total()
      }]);
    }
    else {
      this.agOptions.api.setPinnedBottomRowData([]);
    }
  }

  constructor(private exesvc: ExecutionService, private usersvc: MyDetailsService,
    private progsvc: ProgramsService, private router: Router) { 
    
    var agcomps: any = {
      programCellRendererComponent: ProgramCellRendererComponent,
      eventDetailsCellRendererComponent: EventDetailsCellRendererComponent,
      deleter: DeleteRenderer
    };
    
    var my: ExecutionLineTableComponent = this;
    var namesorter = function (mrId1, mrId2) {
      var name1 = my.programIdNameLkp.get(mrId1);
      var name2 = my.programIdNameLkp.get(mrId2);
      if (name1 === name2) {
        return 0;
      }

      return (name1 < name2 ? -1 : 1);
    }

    var programSetter = function (params): boolean {
      if (params.newValue) {
        var mrid: string = params.newValue.key;
        var elChoices = my.getLineChoices(mrid);
        if (1 == elChoices.length) {
          params.data.line = my.elIdNameLkp.get( elChoices[0] ).line;
          params.data.amt = 0;
        }
        else {
          params.data.line = { mrId: mrid };
          params.data.amt = 0;
        }

        my.setAvailablePrograms();
        return true;
      }

      return false;
    }

    var my: ExecutionLineTableComponent = this;
    var amtSetter = function (params): boolean {
      params.data.amt = Number.parseFloat(params.newValue);
      my.refreshpins();
      my.recheckValidity();
      return true;
    }

    var linesetter = function (params): boolean {
      if (params.newValue && my.elIdNameLkp.has( params.newValue )) {
        params.data.line = my.elIdNameLkp.get(params.newValue).line;
        return true;
      }
      return false;
    }

    var programcellfilter = function (filter: string, cellval: any, filtertext: string): boolean {
      var progname: string = my.programIdNameLkp.get(cellval).toLocaleLowerCase();
      switch (filter) {
        case 'equals':
          return progname === filtertext;
        case 'notEqual':
          return progname !== filtertext;
        case 'startsWith':
          return progname.startsWith(filtertext);
        case 'endsWith':
          return progname.endsWith(filtertext);
        case 'contains':
          return progname.indexOf(filtertext) > -1;
        case 'notContains':
          return progname.indexOf(filtertext) < 0;
        default:
          console.warn('some new filter? ' + filter);
      }

      return true;
    }

    var linecellfilter = function (filter: string, cellval: any, filtertext: string): boolean {
      console.log('into linecellfilter: '+cellval);
      var elname: string = '';
      my.agOptions.api.forEachNode(rn => { 
        if (rn.data.line.id === cellval) {
          elname = rn.data.line.appropriation + '/' + rn.data.line.blin + '/' + rn.data.line.item + '/' + rn.data.line.opAgency;
        }
      });

      elname = elname.toLocaleLowerCase();
      //console.log(elname + ' ' + filter + ' ' + filtertext + '?');
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
        my.recheckValidity();
      },
      context: {
        programlkp: my.programIdNameLkp,
        enabled: false,
        parentComponent: this,
        deleteHidden: false
      },
      columnDefs: [
        {
          headerName: "Program",
          filter: 'agTextColumnFilter',
          filterParams: { 
            textCustomComparator: programcellfilter,
          },
          editable: true,
          comparator: namesorter,
          cellClass: ['ag-cell-light-grey', 'ag-clickable'],
          valueFormatter: params => ( my.programIdNameLkp.has( params.data.line.mrId ) 
            ? my.programIdNameLkp.get(params.data.line.mrId)
            : 'Please choose a Program'),
          field: 'line.mrId',
          cellEditorParams: function(){
            return {
              values: my.availablePrograms,
              formatValue: params => (null == params ? 'Please choose a Program' : params.value)
            };
          },
          valueSetter: programSetter,
          cellEditor: 'agRichSelectCellEditor',
          pinnedRowCellRenderer: params=>''
        },
        {
          headerName: 'Execution Line',
          filter: 'agTextColumnFilter',
          filterParams: {
            textCustomComparator: linecellfilter
          },
          editable: true,
          field: 'line.id',
          valueFormatter: params => ( params.data.line.appropriation
            ? my.elIdNameLkp.get( params.data.line.id ).display
            : params.data.line.mrId ? 'Select an Execution Line' : 'Select a Program first' ),
          cellEditorParams: params => {
            var choices: string[] = my.getLineChoices(params.data.line.mrId);
            //console.log(choices);
            return {
              values: choices,
              formatValue: el => {
                //console.log('formatting value for editor: '+JSON.stringify(el));
                return (my.elIdNameLkp.has(el) ? my.elIdNameLkp.get(el).display : '');
              }
            };
          },
          valueSetter: linesetter,
          cellEditor: 'agRichSelectCellEditor',
          cellClass: ['ag-cell-light-grey'],
          pinnedRowCellRenderer: params => ''
        },
        {
          headerName: 'TOA',
          filter: 'agNumberColumnFilter',
          field: 'line.toa',
          type: 'numericColumn',
          width: 92,
          cellClass: ['ag-cell-light-grey']
        },
        {
          headerName: 'Released',
          filter: 'agNumberColumnFilter',
          field: 'line.released',
          type: 'numericColumn',
          width: 92,
          cellClass: ['ag-cell-light-grey']
        },
        {
          headerName: 'Withheld',
          filter: 'agNumberColumnFilter',
          type: 'numericColumn',
          field: 'line.withheld',
          width: 92,
          cellClass: ['ag-cell-light-grey'],
          pinnedRowCellRenderer: params => 'Total'
        },
        {
          headerName: 'Amount',
          editable: true,
          filter: 'agNumberColumnFilter',
          type: 'numericColumn',
          field: 'amt',
          valueSetter: amtSetter,
          width: 92,
          cellClassRules: {
            'ag-cell-light-grey': params => my.validateOneRow( params.data ),
            'ag-cell-red': params => !my.validateOneRow(params.data)
          }
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
    return this.exevalidator([row], false)[0];
  }

  ngOnInit() {
    this.progsvc.getIdNameMap().subscribe(data => {
      Object.getOwnPropertyNames(data.result).forEach(id => {
        this.programIdNameLkp.set(id, data.result[id]);
      });
      this.setAvailablePrograms();
    });
  }

  addrow() {
    this.agOptions.api.updateRowData({
      add: [{
        line: {},
        amt: 0
      }]
    });

    this.refreshpins();
  }

  delete(rowIndex, data) {
    this.agOptions.api.updateRowData({ remove: [data] });
    this.refreshpins();
    this.recheckValidity();
  }

  getLineChoices(mrid): string[] {
    //console.log('getting line choices for ' + mrid);
    var existingEls: Set<string> = new Set<string>();
    if (this.agOptions && this.agOptions.api) {
      this.agOptions.api.forEachNode(rownode => {
        if (rownode.data.line.id) {
          existingEls.add(rownode.data.line.id);
        }
      });
    }

    //console.log('all exelines: ' + this.elIdNameLkp.size);
    var rets: string[] = [];
    this.elIdNameLkp.forEach((eld, elid) => {
      if (eld.line.mrId === mrid &&
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
    //console.log('checking validity');

    var lines: ExecutionLineWrapper[] = [];
    this.agOptions.api.forEachNodeAfterFilter(rn => { 
      lines.push(rn.data);
    });

    var failure: boolean = false;
    this.exevalidator( lines, true).forEach(x => {
      if (!x) {
        failure = true;
      }
    });

    if (0 === lines.length) {
      failure = true;
    }

    this.tableok = !failure;
    this.agGrid.api.refreshCells(); // need to update CSS classes
  }

  setAvailablePrograms() {
    this.availablePrograms.splice(0, this.availablePrograms.length);

    if (this.programIdNameLkp.size > 0) {
      this.programIdNameLkp.forEach((v, k) => {
        if (this.getLineChoices(k).length > 0) {
          this.availablePrograms.push({
            key: k,
            value: v
          });
        }
      });
    } else {
      console.warn( 'skipping available program determination (no names in map)')
    }
  }

  onGridReady(params) {
    if (this.tmpdata) {
      console.log( 'setting row data from stored data')
      params.api.setRowData(this.tmpdata);
      this.refreshpins();
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
