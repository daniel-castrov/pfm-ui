import { Component, OnInit, ViewChild, Input } from '@angular/core';
import { forkJoin } from "rxjs/observable/forkJoin";

import { HeaderComponent } from '../../../components/header/header.component';
import { MyDetailsService } from '../../../generated/api/myDetails.service';
import { Community } from '../../../generated/model/community';
import { Organization } from '../../../generated/model/organization';
import { TOA } from '../../../generated/model/tOA';
import { CommunityService } from '../../../generated/api/community.service';
import { OrganizationService } from '../../../generated/api/organization.service';
import { PBService } from '../../../generated/api/pB.service';
import { POMService } from '../../../generated/api/pOM.service';
import { IntMap } from '../../../generated/model/intMap';
import { Pom } from '../../../generated/model/pom';
import { PB } from '../../../generated/model/pB';

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
  private fy: number;
  private community: Community;
  private orgs: Organization[];
  private toas: Map<number, number> = new Map<number, number>();
  private orgtoas: Map<string, Map<number, number>> = new Map<string, Map<number, number>>();
  private pb: PB;
  private editsOk: boolean = true;
  private tooMuchToa: boolean = false;
  private orgsums: Map<string, number> = new Map<string, number>();
  private yeardiffs: Map<number, number> = new Map<number, number>();

  constructor(private detailsvc: MyDetailsService, private communityService: CommunityService,
    private orgsvc: OrganizationService, private pomsvc: POMService, private pbsvc: PBService) {
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

  fetch() {
    var my: CreatePomScenarioComponent = this;
    this.detailsvc.getCurrentUser().subscribe((person) => {
      forkJoin([my.communityService.getById(person.result.currentCommunityId),
        my.orgsvc.getByCommunityId(person.result.currentCommunityId),
        my.pomsvc.getByCommunityId(person.result.currentCommunityId),
        my.pbsvc.getLatest(person.result.currentCommunityId),
        my.pomsvc.getToaSamples(person.result.currentCommunityId )
      ]).subscribe(data => {
        var community = data[0].result;
        my.orgs = data[1].result;
        var poms: Pom[] = data[2].result;
        my.pb = data[3].result;
        var samplepom: Pom = data[4].result;

        my.community = community;
        my.fy = my.pb.fy + 2;

        my.toas.clear();
        my.orgtoas.clear();

        my.setInitialValuesAndEditable(poms, samplepom);
        my.resetTotals();
      });
    });
  }

  setInitialValuesAndEditable(poms: Pom[], samplepom: Pom) {
    var my: CreatePomScenarioComponent = this;

    // set everything to 0, just to be safe
    for (var i = 0; i < 5; i++) {
      my.toas.set(my.fy + i, 0);
    }
    samplepom.communityToas.forEach( (toa: TOA) => { 
      my.toas.set(toa.year, toa.amount);
    });

    // set org toas to 0 as well, then update after
    my.orgs.forEach(function (org) {
      var tszeros: Map<number, number> = new Map<number, number>();
      for (var i = 0; i < 5; i++) {
        tszeros.set(my.fy + i, 0);
      }
      my.orgtoas.set(org.id, tszeros);
    });

    Object.keys(samplepom.orgToas).forEach(orgid => {
      samplepom.orgToas[orgid].forEach(toa => {
        my.orgtoas.get(orgid).set(toa.year, toa.amount);
      });
    });

    my.editsOk = true;
    poms.forEach(function (x) {
      if (x.fy === my.fy) {
        my.editsOk = false;

        // we have a POM for this FY, so fill in the values
        x.communityToas.forEach((toa) => {
          my.toas.set(toa.year, toa.amount);
        });

        Object.keys(x.orgToas).forEach(key => {
          var toamap: Map<number, number> = new Map<number, number>();
          x.orgToas[key].forEach(toa => {
            toamap.set(toa.year, toa.amount);
          });
          my.orgtoas.set(key, toamap);
        });
      }
    });
  }

  editfield(event, id, fy) {
    var val: number = Number.parseInt(event.target.innerText);
    if (val > 99999999) {
      val = 99999999;
    }

    if (id === this.community.id) {
      this.toas.set(Number.parseInt(fy), val);
    }
    else {
      this.orgtoas.get(id).set(Number.parseInt(fy), val);
    }

    this.resetTotals();
  }

  resetTotals() {
    var my: CreatePomScenarioComponent = this;

    // update our running totals
    my.orgsums.clear();
    my.yeardiffs.clear();
    my.tooMuchToa = false;

    var amt = 0;
    my.toas.forEach(function (val, year) {
      amt += val;
      my.yeardiffs.set(year, val);

      if (!my.orgsums.has(my.community.id)) {
        my.orgsums.set(my.community.id, 0);
      }
      my.orgsums.set(my.community.id, my.orgsums.get(my.community.id) + val);
    });

    //console.log(my.orgtoas);
    //console.log(my.toas);

    amt = 0;
    my.orgtoas.forEach(function (toas, orgid) {
      my.orgsums.set(orgid, 0);
      toas.forEach(function (amt, year) {
        my.yeardiffs.set(year, my.yeardiffs.get(year) - amt);
        my.orgsums.set(orgid, my.orgsums.get(orgid) + amt);

        if (my.yeardiffs.get(year) < 0) {
          my.tooMuchToa = true;
        }
      });
    });

  }


  submit() {
    var my: CreatePomScenarioComponent = this;
    var toas: TOA[] = [];
    my.toas.forEach(function (amt, yr) {
      var t: TOA = {
        year: yr,
        amount: amt
      };
      toas.push(t);
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
      communityToas: toas,
      orgToas: otoas,
      fy: this.fy
    };

    //console.log('calling setToas!');
    //console.log(transfer);
    this.pomsvc.createPom(this.community.id, this.fy, transfer, my.pb.id).subscribe(
      (data) => {
        if (data.result) {
          my.editsOk = false;
        }
      });
  }
}
