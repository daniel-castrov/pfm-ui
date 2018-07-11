import { Component, OnInit, ViewChild, Input } from '@angular/core'
import * as $ from 'jquery'

// Other Components
import { HeaderComponent } from '../../../components/header/header.component'
import { Router } from '@angular/router'
import { ExecutionService, Execution, MyDetailsService, Program, ExecutionLine } from '../../../generated'
import { GlobalsService } from '../../../services/globals.service'
import { forkJoin } from 'rxjs/observable/forkJoin';
import { ProgramsService } from '../../../generated/api/programs.service';
import { ExcelTable } from 'ag-grid/dist/lib/interfaces/iExcelCreator';

declare const $: any;
declare const jQuery: any;

@Component({
  selector: 'app-execution-line-table',
  templateUrl: './execution-line-table.component.html',
  styleUrls: ['./execution-line-table.component.scss']
})
export class ExecutionLineTableComponent implements OnInit {
  @ViewChild(HeaderComponent) header;
  @Input() private phase: Execution;
  @Input() private updatelines: ExecutionLine[];
  private allexelines: ExecutionLine[] = [];
  private programIdNameLkp: Map<string, string> = new Map<string, string>();

  constructor(private exesvc: ExecutionService, private usersvc: MyDetailsService,
    private progsvc: ProgramsService, private router: Router) { }

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
      console.log(my.phase);
      my.exesvc.getExecutionLinesByPhase(my.phase.id).subscribe(d2 => {
        my.allexelines = d2.result;
      });

      Object.getOwnPropertyNames(data[0].result).forEach(id => {
        my.programIdNameLkp.set(id, data[0].result[id]);
      });
    });
  }

  fullname(exeline: ExecutionLine): string {
    if (this.programIdNameLkp && exeline) {
      return this.programIdNameLkp.get(exeline.mrId);
    }
    else {
      return '';
    }
  }

  addrow() {
    this.updatelines.push({});
  }

  removerow(i) {
    this.updatelines.splice(i, 1);
  }

  setline(updateidx: number, lineidx: number) {
    var my: ExecutionLineTableComponent = this;
    var toupdate: ExecutionLine = my.updatelines[updateidx];

    var l: ExecutionLine = my.getLineChoices(toupdate.mrId)[lineidx - 1];
    toupdate.appropriation = l.appropriation;
    toupdate.blin = l.blin;
    toupdate.item = l.item;
    toupdate.opAgency = l.opAgency;
    toupdate.toa = 0;
    toupdate.released = 0;
    toupdate.id = l.id;
  }

  getLineChoices(mrid): ExecutionLine[] {
    return this.allexelines.filter(x => x.mrId === mrid);
  }

  onedit(amtstr, updateidx) {
    var my: ExecutionLineTableComponent = this;
    var toupdate: ExecutionLine = my.updatelines[updateidx];
    toupdate.released = Number.parseInt(amtstr);
  }

  total(): number {
    var my: ExecutionLineTableComponent = this;

    var tot: number = 0;
    for (var i = 0; i < my.updatelines.length; i++) {
      if (my.updatelines[i].released) {
        tot += my.updatelines[i].released;
      }
    }

    return tot;
  }
}
