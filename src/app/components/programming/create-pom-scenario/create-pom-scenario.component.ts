import { Component, OnInit, ViewChild, Input } from '@angular/core';
import { forkJoin } from "rxjs/observable/forkJoin";

import { HeaderComponent } from '../../../components/header/header.component';
import { MyDetailsService } from '../../../generated/api/myDetails.service';
import { Community } from '../../../generated/model/community';
import { Organization } from '../../../generated/model/organization';
import { TOA } from '../../../generated/model/tOA';
import { CommunityService } from '../../../generated/api/community.service';
import { OrganizationService } from '../../../generated/api/organization.service';
import { POMService } from '../../../generated/api/pOM.service';
import { IntMap } from '../../../generated/model/intMap';
import { Pom } from '../../../generated/model/pom';

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
  private fy: number = new Date().getFullYear() + 2;
  private modelyear: number = new Date().getFullYear();
  private community: Community;
  private orgs: Organization[];
  private years: number[];
  private toas: Map<number, number> = new Map<number, number>();
  private orgtoas: Map<string, Map<number,number>> = new Map<string,Map<number,number>>();
  private poms: Pom[];

  constructor(private userDetailsService: MyDetailsService, private communityService: CommunityService,
    private orgsvc: OrganizationService, private pomsvc:POMService) {
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

    this.fetch();
  }

  allowedits(): boolean {
    var my: CreatePomScenarioComponent = this;
    this.years.forEach(function (yr) {
      if (yr === my.fy) {
        return false;
      }
    });
    return true;
  }

  fetch(){
    var my: CreatePomScenarioComponent = this;
    this.userDetailsService.getCurrentUser().subscribe((person) => {
      forkJoin([my.communityService.getById(person.result.currentCommunityId),
        my.orgsvc.getByCommunityId(person.result.currentCommunityId),
        my.pomsvc.getById( person.result.currentCommunityId )
      ]).subscribe(data => {
        var community = data[0].result;
        my.orgs = data[1].result;
        my.poms = data[2].result;
        console.log(community);

        var tempyears: number[] = [];
        my.poms.forEach(function (pom) {
          tempyears.push(pom.fy);
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
    my.modelyear = year;

    my.toas.clear();
    my.orgtoas.clear();
    my.poms.forEach(function (pom) {
      if (pom.fy === year ) {
        var modelpom = pom;
        pom.toas.forEach(function (toa: TOA) {
          if (toa.year >= my.fy) {
            my.toas.set(toa.year, toa.amount);
          }
        });

        // fill in any missing years
        for (var i = my.fy; i < my.fy + 5; i++) {
          if (!my.toas.has(i)) {
            my.toas.set(i, 0);
          }
        }

        Object.getOwnPropertyNames(pom.orgToas).forEach(function (orgid) { 
          var map: Map<number, number> = new Map<number, number>();
          pom.orgToas[orgid].forEach(function (toa: TOA) { 
            if (toa.year >= my.fy) {
              map.set(toa.year, toa.amount);
            }
          });
          
          // fill in any missing years
          for (var i = my.fy; i < my.fy + 5; i++) {
            if (!map.has(i)) {
              map.set(i, 0);
            }
          }

          my.orgtoas.set(orgid, map);
        });
      }
    });

    //console.log(my.toas);
    //console.log(my.orgtoas);
  }

  editfield(event, id, fy) {
    if (id === this.community.id) {
      this.toas.set(Number.parseInt(fy), Number.parseFloat(event.target.innerText));
    }
    else {
      this.orgtoas.get(id).set(Number.parseInt(fy), Number.parseFloat(event.target.innerText));
    }
  }

  submit() {
    var my: CreatePomScenarioComponent = this;

    var toas: TOA[] = [];
    my.toas.forEach(function (amt, yr) {
      toas.push({ year: yr, amount: amt });
    });

    var otoas: { [key: string]: TOA[]; } = {};
    my.orgtoas.forEach(function (toamap, orgid) {
      var tlist: TOA[] = [];
      my.orgtoas.get(orgid).forEach(function (amt, yr) {
        tlist.push({ year: yr, amount: amt });
      });
      otoas[orgid] = tlist;
    });

    var transfer: Pom = {
      toas: toas,
      orgToas: otoas,
      fy: this.fy
    };

    //console.log('calling setToas!');
    //console.log(transfer);
    this.pomsvc.createPom(this.community.id, this.fy, transfer).subscribe(
      (data) => {
        my.fetch();
      });
  }

}
