import { Component, OnInit, ViewChild } from '@angular/core';
import * as $ from 'jquery';

// Other Components
import { HeaderComponent } from '../../../components/header/header.component';
import { PBService } from '../../../generated/api/pB.service'
import { MyDetailsService } from '../../../generated/api/myDetails.service'
import { ExecutionService } from '../../../generated/api/execution.service'
import { PB } from '../../../generated/model/pB'
import { Execution } from '../../../generated/model/execution';
import { Router, ActivatedRoute } from '@angular/router';
import { ExecutionLine } from '../../../generated';

declare const $: any;
declare const jQuery: any;

@Component({
  selector: 'appropriation-release',
  templateUrl: './appropriation-release.component.html',
  styleUrls: ['./appropriation-release.component.scss']
})


export class AppropriationReleaseComponent implements OnInit {
  @ViewChild(HeaderComponent) header;
  private updatelines: ExecutionLine[] = [];
  private phase:Execution;

  constructor(private exesvc: ExecutionService, private route: ActivatedRoute) { }

  ngOnInit() {

    //jQuery for editing table
    var $TABLE = $('#appropriation-release');
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
    this.route.params.subscribe(data => { 
      this.exesvc.getById(data.phaseId).subscribe(d2 => { 
        this.phase = d2.result;
      });
    });
  }
}
