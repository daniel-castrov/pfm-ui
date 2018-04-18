import { Component, OnInit, ViewChild, Input } from '@angular/core';
import { forkJoin } from "rxjs/observable/forkJoin";

import { HeaderComponent } from '../../../components/header/header.component';
import { MyDetailsService } from '../../../generated/api/myDetails.service';
import { Community } from '../../../generated/model/community';
import { Organization } from '../../../generated/model/organization';
import { TOA } from '../../../generated/model/TOA';
import { CommunityService } from '../../../generated/api/community.service';
import { OrganizationService } from '../../../generated/api/organization.service';

@Component({
  selector: 'app-create-pom-scenario',
  templateUrl: './create-pom-scenario.component.html',
  styleUrls: ['./create-pom-scenario.component.scss']
})
export class CreatePomScenarioComponent implements OnInit {
  @ViewChild(HeaderComponent) header;
  private fy: number = new Date().getFullYear() + 1;
  private by: number = new Date().getFullYear();
  private community: Community;
  private orgs: Organization[];
  private years: number[];
  private toa: number;
  private orgtoas: Map<string, number> = new Map<string, number>();


  constructor(private userDetailsService: MyDetailsService, private communityService: CommunityService,
  private orgsvc : OrganizationService ) {
  }

  ngOnInit() {
    var my: CreatePomScenarioComponent = this;
    this.userDetailsService.getCurrentUser().subscribe((person) => {

      forkJoin([my.communityService.getById(person.result.currentCommunityId),
        my.orgsvc.getByCommunityId(person.result.currentCommunityId)]).subscribe(data => {
          my.community = data[0].result;
          my.orgs = data[1].result;

          var tempyears: number[] = [];
          my.community.toas.forEach(function (toa) {
            tempyears.push(toa.year);
          });
          tempyears.sort();
          my.years = tempyears;
          my.setYear(my.years[my.years.length - 1]);
        });
      });
  }

  setYear(year) {
    var my: CreatePomScenarioComponent = this;
    console.log('setting year to ' + year);
    my.by = Number.parseInt(year);

    my.community.toas.forEach(function (toa) {
      if (toa.year == my.by ) {
        my.toa = toa.amount;
      }
    });

    //console.log(my.orgs);
    my.orgtoas = new Map<string, number>();
    my.orgs.forEach(function (org) {
      //console.log(org.name + ' ->' + org.abbreviation);
      org.toas.forEach(function (toa) {
        //console.log('  ' + toa.year + ' (' + typeof (toa.year) + ')  -> ' + my.by + ' (' + typeof (my.by) + ')');
        if (toa.year === my.by ) {
          my.orgtoas[org.id] = toa.amount;
          //console.log('\tsetting orgtoa for ' + org.abbreviation + ' to ' + toa.amount);
        }
      });
    });
    //console.log(my.orgtoas);
  }


  submit() {
    var my: CreatePomScenarioComponent = this;
    my.community.toas.push({ year: my.fy, amount: my.toa });
    
  }
}
