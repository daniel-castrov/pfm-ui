import { Component, OnInit, ViewChild } from '@angular/core'
import * as $ from 'jquery'

// Other Components
import { HeaderComponent } from '../../../components/header/header.component'
import { PBService } from '../../../generated/api/pB.service'
import { MyDetailsService } from '../../../generated/api/myDetails.service'
import { ExecutionService } from '../../../generated/api/execution.service'
import { ExecutionTransfer } from '../../../generated/model/executionTransfer'
import { PB } from '../../../generated/model/pB'
import { Execution } from '../../../generated/model/execution'
import { Router, ActivatedRoute, UrlSegment } from '@angular/router'
import { ExecutionLine, ProgramsService } from '../../../generated';
import { forkJoin } from 'rxjs/observable/forkJoin';

declare const $: any;
declare const jQuery: any;

@Component({
  selector: 'update-program-execution',
  templateUrl: './update-program-execution.component.html',
  styleUrls: ['./update-program-execution.component.scss']
})
export class UpdateProgramExecutionComponent implements OnInit {
  @ViewChild(HeaderComponent) header;
  private current: ExecutionLine;
  private phase: Execution;
  private allexelines: ExecutionLine[] = [];
  private updateexelines: ExecutionLine[] = [];
  private programIdNameLkp: Map<string, string> = new Map<string, string>();

  private etype: string;
  private ttype: string;
  private longname: string;
  private reason: string;

  constructor(private exesvc: ExecutionService, private progsvc:ProgramsService,
    private route: ActivatedRoute) { }

  ngOnInit() {

    //jQuery for editing table
    var $TABLE = $('#update-program-execution');
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

    var my: UpdateProgramExecutionComponent = this;
    this.route.url.subscribe((segments: UrlSegment[]) => {
      var exelineid = segments[segments.length - 1].path;

      forkJoin([
        my.exesvc.getExecutionLineById(exelineid),
        my.progsvc.getIdNameMap()
      ]).subscribe(data => { 
        my.current = data[0].result;

        my.exesvc.getExecutionLinesByPhase(my.current.phaseId).subscribe(d2 => {
          my.allexelines = d2.result;
        });
        my.exesvc.getById(my.current.phaseId).subscribe(d2 => {
          my.phase = d2.result;
        });

        Object.getOwnPropertyNames(data[1].result).forEach(id => {
          my.programIdNameLkp.set(id, data[1].result[id]);
        });
      });
    });
  }

  submit() {
    var et: ExecutionTransfer = {
      toIdAmtLkp: {},
      fromId: this.current.id,
      eventType: this.etype,
      transType: this.ttype,
      reason: this.reason,
      longname: this.longname
    };
    this.updateexelines.forEach(l => { 
      et.toIdAmtLkp[l.id] = l.released; // FIXME: this is just a placeholder
    });

    console.log( 'I don\'t do anything yet!')
    //this.exesvc.createTransfer(this.phase.id, new Blob(["stuff"]),
    //  new Blob([JSON.stringify(et)])).subscribe();
  }

  fullname(exeline: ExecutionLine): string {
    if( this.programIdNameLkp && exeline ){
      return this.programIdNameLkp.get(exeline.mrId);
    }
    else {
      return '';
    }
  }
}
