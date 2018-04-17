import { Component, OnInit, ViewChild, Input } from '@angular/core';
import { HeaderComponent } from '../../../components/header/header.component';
import { MyDetailsService } from '../../../generated/api/myDetails.service';
import { Community } from '../../../generated/model/community';
import { Organization } from '../../../generated/model/organization';
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
  private by: number = new Date().getFullYear() - 1;
  private community: Community;
  private orgs: Organization[];
  private toa: number;
  private orgtoas: Map<string, number> = new Map<string, number>();


  constructor(private userDetailsService: MyDetailsService, private communityService: CommunityService,
  private orgsvc : OrganizationService ) {
  }

  ngOnInit() {
    var my: CreatePomScenarioComponent = this;
    this.userDetailsService.getCurrentUser().subscribe((person) => {
      my.communityService.getById(person.result.currentCommunityId).subscribe((data) => {
        my.community = data.result;
        //console.log(my.community);
        my.community.toas.forEach(function (x) { 
          if (x.year === my.by) {
            my.toa = x.amount;
          }
        });
      });

      this.orgsvc.getByCommunityId(person.result.currentCommunityId).subscribe((data) => { 
        my.orgs = data.result;
        my.orgtoas.clear();
        my.orgs.forEach(function (x) { 
          x.toas.forEach(function (t) { 
            if (t.year === my.by) {
              my.orgtoas[x.id] = t.amount;              
            }
          });
        });

        console.log(my.orgtoas);
      });
    });

  }
}
