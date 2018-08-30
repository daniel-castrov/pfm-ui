import { Component, OnInit, ViewChild, Input } from '@angular/core'
import * as $ from 'jquery'

// Other Components
import { HeaderComponent } from '../../header/header.component'
import { Router } from '@angular/router'
import { ExecutionService, Execution, MyDetailsService, Program, ExecutionLine } from '../../../generated'
import { forkJoin } from 'rxjs/observable/forkJoin';
import { ProgramsService } from '../../../generated/api/programs.service';
import { ExecutionLineWrapper } from '../model/execution-line-wrapper'
import { ExecutionLineFilter } from '../model/execution-line-filter'
import { GridOptions } from 'ag-grid';
import { AgGridNg2 } from 'ag-grid-angular';
import { ProgramCellRendererComponent } from '../../renderers/program-cell-renderer/program-cell-renderer.component';
import { EventDetailsCellRendererComponent } from '../../renderers/event-details-cell-renderer/event-details-cell-renderer.component';
import { DeleteRenderer } from "../../renderers/delete-renderer/delete-renderer.component";

declare const $: any;
declare const jQuery: any;

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
  private _updatelines: ExecutionLineWrapper[] = [];
  private allexelines: ExecutionLine[] = [];
  private programIdNameLkp: Map<string, string> = new Map<string, string>();
  private agOptions: GridOptions;

  @Input() set updatelines(newdata: ExecutionLineWrapper[] ) {
    this._updatelines = newdata;
    if (this.agOptions && this.agOptions.api) {
      this.agOptions.api.refreshCells();
    }
  }

  get updatelines() {
    return this._updatelines;
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

      return true;
    }

    var elSetter = function (params): boolean {
      console.log('setting the EL!');
      console.log(params);
      
      //toupdate.line.appropriation = l.appropriation;
      //toupdate.line.blin = l.blin;
      //toupdate.line.item = l.item;
      //toupdate.line.opAgency = l.opAgency;
      //toupdate.line.toa = l.toa;
      //toupdate.line.released = l.released;
      //toupdate.line.id = l.id;
      //toupdate.line.withheld = l.withheld;
      //this.agOptions.api.setRowData(this._updatelines);

      return true;
    }
    var my: ExecutionLineTableComponent = this;

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
        parentComponent: this
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
            var progs:{}[] = my.programList();
            console.log(progs);
            return {
              values: progs,
              formatValue: params => (null == params ? 'Please choose a Program' : params.value)
            };
          },
          valueSetter: programSetter,
          cellEditor: 'agRichSelectCellEditor'
        },
        {
          headerName: 'Execution Line',
          filter: 'agTextColumnFilter',
          editable: true,
          onCellValueChanged: elSetter,
          field: 'line',
          valueFormatter: params => (params.data.line.appropriation
            ? params.data.line.appropriation + '/' + params.data.line.blin + '/' + params.data.line.item + '/' + params.data.line.opAgency
            : 'Select a Program first'),
          cellEditorParams: params => { 
            console.log(params);
            console.log(my.getLineChoices(params.data.line.mrId));
            return {
              values: my.getLineChoices(params.data.line.mrId),
              formatValue: el => {
                console.log(el);
                return (el.appropriation
                  ? el.appropriation + '/' + el.blin + '/' + el.item + '/' + el.opAgency
                  : '');
              }
            };
          },
          //cellEditorParams: params => ({
          //  values: my.getLineChoices(params.data.line.mrId),
          //  formatValue: el => (el.appropriation
          //    ? el.appropriation + '/' + el.blin + '/' + el.item + '/' + el.opAgency
          //    : '')
          //} ),
//          valueSetter: elSetter,
          cellEditor: 'agRichSelectCellEditor',
          cellClass: ['ag-cell-light-grey']
        },
        {
          headerName: 'TOA',
          filter: 'agNumberColumnFilter',
          field: 'line.toa',
          width: 92,
          cellClass: ['ag-cell-light-grey']
        },
        {
          headerName: 'Released',
          filter: 'agNumberColumnFilter',
          field: 'line.released',
          width: 92,
          cellClass: ['ag-cell-light-grey']
        },
        {
          headerName: 'Withheld',
          filter: 'agNumberColumnFilter',
          field: 'line.withheld',
          width: 92,
          cellClass: ['ag-cell-light-grey']
        },
        {
          headerName: 'Amount',
          editable: true,
          filter: 'agNumberColumnFilter',
          field: 'amt',
          width: 92,
          cellClass: ['ag-cell-light-grey']
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

  ngOnInit() {
    //jQuery for editing table
    var $TABLE = $('.execution-line-table');
    var $BTN = $('#export-btn');
    var $EXPORT = $('#export');

    $('.table-add').click(function () {
      var $clone = $TABLE.find('tr.hide').clone(true).removeClass('hide table-line');
      $TABLE.find('table').append($clone);
    });

    $('.table-remove').click(function () {
      $(this).parents('tr').detach();
    });

    $('.table-up').click(function () {
      var $row = $(this).parents('tr');
      if ($row.index() === 1) return; // Don't go above the header
      $row.prev().before($row.get(0));
    });

    $('.table-down').click(function () {
      var $row = $(this).parents('tr');
      $row.next().after($row.get(0));
    });

    // A few jQuery helpers for exporting only
    jQuery.fn.pop = [].pop;
    jQuery.fn.shift = [].shift;

    $BTN.click(function () {
      var $rows = $TABLE.find('tr:not(:hidden)');
      var headers = [];
      var data = [];

      // Get the headers (add special header logic here)
      $($rows.shift()).find('th:not(:empty)').each(function () {
        headers.push($(this).text().toLowerCase());
      });

      // Turn all existing rows into a loopable array
      $rows.each(function () {
        var $td = $(this).find('td');
        var h = {};

        // Use the headers from earlier to name our hash keys
        headers.forEach(function (header, i) {
          h[header] = $td.eq(i).text();
        });

        data.push(h);
      });

      // Output the result
      $EXPORT.text(JSON.stringify(data));
    });

    var my: ExecutionLineTableComponent = this;
    forkJoin([
      my.progsvc.getIdNameMap()
    ]).subscribe(data => {
      //console.log(my.phase);
      my.exesvc.getExecutionLinesByPhase(my.phase.id).subscribe(d2 => {
        my.allexelines = d2.result
          .filter(y => (this.exeprogramfilter ? this.exeprogramfilter(y) : y.released > 0));
      });

      Object.getOwnPropertyNames(data[0].result).forEach(id => {
        my.programIdNameLkp.set(id, data[0].result[id]);
      });

      my.allexelines.sort((a, b) => {
        if (my.fullname(a) === my.fullname(b)) {
          return 0;
        }
        return (my.fullname(a) < my.fullname(b) ? -1 : 1);
      });
    });
  }

  fullname(exeline: ExecutionLine): string {
    if (this.programIdNameLkp && exeline) {
      //console.log(exeline);
      return this.programIdNameLkp.get(exeline.mrId);
    }
    else {
      return '';
    }
  }

  addrow() {
    this._updatelines.push({
      line: {},
      amt: 0
    });

    this.agOptions.api.updateRowData({
      add: [{
        line: {}, amt: 0
      }]
    });
  }

  removerow(i) {
    this._updatelines.splice(i, 1);
    this.agOptions.api.setRowData(this._updatelines);
  }

  setline(updateidx: number, lineidx: number) {
    var toupdate: ExecutionLineWrapper = this._updatelines[updateidx];
    var l: ExecutionLine = this.getLineChoices(toupdate.line.mrId)[lineidx - 1];

    toupdate.line.appropriation = l.appropriation;
    toupdate.line.blin = l.blin;
    toupdate.line.item = l.item;
    toupdate.line.opAgency = l.opAgency;
    toupdate.line.toa = l.toa;
    toupdate.line.released = l.released;
    toupdate.line.id = l.id;
    toupdate.line.withheld = l.withheld;
    this.agOptions.api.setRowData(this._updatelines);
  }

  getLineChoices(mrid): ExecutionLine[] {
    var existingeEls: Set<string> = new Set<string>();
    this._updatelines.forEach(x => { 
      existingeEls.add(x.line.id);
    });

    return this.allexelines
      .filter(x => x.mrId === mrid)
      .filter(y => (this.exelinefilter ? this.exelinefilter(y) : true))
      .filter(z => !existingeEls.has(z.id) // we can't add the same EL twice
      );
  }

  onedit(amtstr, updateidx) {
    var my: ExecutionLineTableComponent = this;
    var toupdate: ExecutionLineWrapper = my._updatelines[updateidx];
    toupdate.amt = Number.parseInt(amtstr);
  }

  total(): number {
    var my: ExecutionLineTableComponent = this;

    var tot: number = 0;
    for (var i = 0; i < my._updatelines.length; i++) {
      if (my._updatelines[i].amt ) {
        tot += my._updatelines[i].amt;
      }
    }

    return tot;
  }

  updateapprs(idx) {
    if (1 == this.getLineChoices(this._updatelines[idx].line.mrId).length) {
      this._updatelines[idx] = {
        line: this.getLineChoices(this._updatelines[idx].line.mrId)[0],
        amt: 0
      } 
    }
  }

  programList(): {}[] {
    var list: {}[] = [];
    this.programIdNameLkp.forEach((v, k) => { 
      if (this.getLineChoices(k).length > 0) {
        list.push({
          key: k,
          value: v
        });
      }
    });

    return list;
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
