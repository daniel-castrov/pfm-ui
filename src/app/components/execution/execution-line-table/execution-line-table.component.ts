import { Component, OnInit, ViewChild, Input } from '@angular/core'

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
  styleUrls: ['./execution-line-table.component.scss']
})
export class ExecutionLineTableComponent implements OnInit {
  @ViewChild(HeaderComponent) header;
  @ViewChild("agGrid") private agGrid: AgGridNg2;
  @Input() private phase: Execution;
  @Input() private sourceOrTarget: string = 'to select target programs';
  @Input() private exelinefilter: ExecutionLineFilter;
  @Input() private exeprogramfilter: ExecutionLineFilter;
  @Input() exevalidator: ExecutionTableValidator = function (x: ExecutionLineWrapper[]): boolean[] {
    var okays: boolean[] = [];
    x.forEach((el: ExecutionLineWrapper) => {
      okays.push((el.line.toa ? el.line.toa - el.line.withheld - el.line.released >= el.amt : true));
    });
    return okays;
  };
  tableok: boolean = false;
  private _updatelines: ExecutionLineWrapper[] = [];
  private allexelines: ExecutionLine[] = [];
  private programIdNameLkp: Map<string, string> = new Map<string, string>();
  private agOptions: GridOptions;
  private availablePrograms: {}[] = [];

  @Input() set updatelines(newdata: ExecutionLineWrapper[]) {
    this._updatelines = newdata;
    if (this.agOptions && this.agOptions.api) {
      this.agOptions.api.setRowData(newdata);
      this.agOptions.api.refreshCells();
      this.recheckValidity();
    }
  }

  get updatelines() {
    return this._updatelines;
  }

  refreshlines() {
    this._updatelines.splice(0, this._updatelines.length);
    this.agOptions.api.forEachNode(rownode => {
      this._updatelines.push(rownode.data);
    });
    this.refreshpins();
  }

  refreshpins() {
    if (this._updatelines.length > 0) {
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
      var mrid: string = params.newValue.key;
      var elChoices = my.getLineChoices(mrid);
      if (1 == elChoices.length ) {
        params.data.line = elChoices[0];
        params.data.amt = 0;
      }
      else {
        params.data.line = { mrId: mrid };
        params.data.amt = 0;
      }

      my.setAvailablePrograms();

      return true;
    }

    var my: ExecutionLineTableComponent = this;
    var amtSetter = function (params): boolean {
      params.data.amt = Number.parseFloat(params.newValue);
      my.refreshlines();
      my.recheckValidity();
      return true;
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
        programlkp: my.programIdNameLkp,
        enabled: false,
        parentComponent: this,
        deleteHidden: false
      },
      columnDefs: [
        {
          headerName: "Program",
          filter: 'agTextColumnFilter',
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
          editable: true,
          field: 'line',
          valueFormatter: params => (params.data.line.appropriation
            ? params.data.line.appropriation + '/' + params.data.line.blin + '/' + params.data.line.item + '/' + params.data.line.opAgency
            : params.data.line.mrId ? 'Select an Execution Line' : 'Select a Program first' ),
          cellEditorParams: params => ({
            values: my.getLineChoices(params.data.line.mrId),
            formatValue: el => (el.appropriation
              ? el.appropriation + '/' + el.blin + '/' + el.item + '/' + el.opAgency
              : '')
          } ),
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
          width: 92,
          cellRenderer: 'deleter',
          cellClass: ['ag-cell-light-grey']
        }
      ]
    };
  }

  validateOneRow(row): boolean {
    return this.exevalidator([row], false)[0];
  }

  ngOnInit() {
    var my: ExecutionLineTableComponent = this;
    forkJoin([
      my.progsvc.getIdNameMap()
    ]).subscribe(data => {
      Object.getOwnPropertyNames(data[0].result).forEach(id => {
        my.programIdNameLkp.set(id, data[0].result[id]);
      });

      my.exesvc.getExecutionLinesByPhase(my.phase.id).subscribe(d2 => {
        my.allexelines = d2.result
          .filter(y => (this.exeprogramfilter ? this.exeprogramfilter(y) : y.released > 0));
        this.setAvailablePrograms();
      });
    });
  }

  addrow() {
    this.agOptions.api.updateRowData({
      add: [{
        line: {},
        amt: 0
      }]
    });
  }

  delete(rowIndex, data) {
    this.agOptions.api.updateRowData({remove: [data]});
    this.refreshlines();
    this.recheckValidity();
  }

  getLineChoices(mrid): ExecutionLine[] {
    var existingeEls: Set<string> = new Set<string>();
    if (this.agOptions && this.agOptions.api) {
      this.agOptions.api.forEachNode(rownode => {
        if (rownode.data.line.id) {
          existingeEls.add(rownode.data.line.id);
        }
      });
    }

    return this.allexelines
      .filter(x => x.mrId === mrid)
      .filter(y => (this.exelinefilter ? this.exelinefilter(y) : true))
      .filter(z => !existingeEls.has(z.id) // we can't add the same EL twice
      );
  }

  total(): number {
    var tot: number = 0;
    for (var i = 0; i < this._updatelines.length; i++) {
      if (this._updatelines[i].amt ) {
        tot += this._updatelines[i].amt;
      }
    }
    return tot;
  }

  recheckValidity() {
    var failure: boolean = false;
    this.exevalidator(this._updatelines, true).forEach(x => {
      if (!x) {
        failure = true;
      }
    });

    this.tableok = !failure;
    this.agGrid.api.refreshCells();
  }

  setAvailablePrograms() {
    this.availablePrograms.splice(0, this.availablePrograms.length);
    this.programIdNameLkp.forEach((v, k) => {
      if (this.getLineChoices(k).length > 0) {
        this.availablePrograms.push({
          key: k,
          value: v
        });
      }
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
}
