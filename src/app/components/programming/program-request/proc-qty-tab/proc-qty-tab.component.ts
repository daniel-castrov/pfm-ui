import { Component, OnInit, Input, ViewChild, OnChanges } from '@angular/core';
import { ProgrammaticRequest} from '../../../../generated'
import { FeedbackComponent } from './../../../feedback/feedback.component';

import * as $ from 'jquery';

declare const $: any;
declare const jQuery: any;

@Component({
  selector: 'proc-qty-tab',
  templateUrl: './proc-qty-tab.component.html',
  styleUrls: ['./proc-qty-tab.component.scss']
})
export class ProcQtyTabComponent implements OnInit {


  @ViewChild(FeedbackComponent) feedback: FeedbackComponent;
  @Input() pr: ProgrammaticRequest;

  constructor() { }

  ngOnChanges(){
    if(!this.pr.phaseId) return; // the parent has not completed it's ngOnInit()
    console.log(this.pr)
  }

  ngOnInit() {

    /*
    //jQuery for editing table
    var $TABLE = $('#proc-qty');
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
  */
  }
}
