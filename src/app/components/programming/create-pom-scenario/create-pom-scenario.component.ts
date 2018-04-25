import { Component, OnInit, ViewChild, Input } from '@angular/core';
import { forkJoin } from "rxjs/observable/forkJoin";

import { HeaderComponent } from '../../../components/header/header.component';
import { MyDetailsService } from '../../../generated/api/myDetails.service';
import { Community } from '../../../generated/model/community';
import { Organization } from '../../../generated/model/organization';
import { TOA } from '../../../generated/model/tOA';
import { ToaTransfer } from '../../../generated/model/toaTransfer';
import { CommunityService } from '../../../generated/api/community.service';
import { OrganizationService } from '../../../generated/api/organization.service';
import { IntMap } from '../../../generated/model/intMap';
import * as $ from 'jquery';

declare const $: any;
declare const jQuery: any;

@Component({
  selector: 'app-create-pom-scenario',
  templateUrl: './create-pom-scenario.component.html',
  styleUrls: ['./create-pom-scenario.component.scss']
})
export class CreatePomScenarioComponent implements OnInit {
  @ViewChild(HeaderComponent) header;
  private fy: number = new Date().getFullYear() + 1;
  private modelyear: number = new Date().getFullYear();
  private community: Community;
  private orgs: Organization[];
  private years: number[];
  private toa: number;
  private orgtoas: {} = {};


  constructor(private userDetailsService: MyDetailsService, private communityService: CommunityService,
    private orgsvc: OrganizationService) {
  }

  ngOnInit() {

    //jQuery for editing table
    var $TABLE = $('#toa2', '#toa2');
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

    var my: CreatePomScenarioComponent = this;
    this.userDetailsService.getCurrentUser().subscribe((person) => {

      forkJoin([my.communityService.getById(person.result.currentCommunityId),
        my.orgsvc.getByCommunityId(person.result.currentCommunityId)]).subscribe(data => {
          var community = data[0].result;
          my.orgs = data[1].result;

          var tempyears: number[] = [];
          community.toas.forEach(function (toa) {
            tempyears.push(toa.year);
          });
          tempyears.sort();
          my.community = community;
          my.setYear(tempyears[tempyears.length - 1]);
          my.years = tempyears;
        });
      });

  }

  setYear(year) {
    var my: CreatePomScenarioComponent = this;
    console.log('setting year to ' + year);
    my.modelyear = Number.parseInt(year);

    my.community.toas.forEach(function (toa) {
      if (toa.year == my.modelyear ) {
        my.toa = toa.amount;
      }
    });

    //console.log(my.orgs);
    my.orgtoas = {};
    my.orgs.forEach(function (org) {
      //console.log(org.name + ' ->' + org.abbreviation);
      org.toas.forEach(function (toa) {
        //console.log('  ' + toa.year + ' (' + typeof (toa.year) + ')  -> ' + my.by + ' (' + typeof (my.by) + ')');
        if (toa.year === my.modelyear ) {
          my.orgtoas[org.id] = toa.amount;
          //console.log('\tsetting orgtoa for ' + org.abbreviation + ' to ' + toa.amount);
        }
      });
    });
    //console.log(my.orgtoas);
  }


  submit() {
    var my: CreatePomScenarioComponent = this;
    var map: IntMap = {};
    Object.getOwnPropertyNames(my.orgtoas).forEach(function (orgid){
      map[orgid] = my.orgtoas[orgid];
    });

    var transfer: ToaTransfer = {
      year: my.fy,
      toa: my.toa,
      orgToas: map
    };

    console.log('calling setToas!');
    console.log(transfer);
    this.communityService.setToas(my.community.id, transfer).subscribe(
      (data) => {
        my.ngOnInit();
      });
  }

}
