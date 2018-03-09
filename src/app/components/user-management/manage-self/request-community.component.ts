import { FilterComponent } from './../../filter/filter.component';
import { Component, OnInit, ViewChild } from '@angular/core';
import { Observable } from 'rxjs';
import * as $ from 'jquery';

// Other Components
import { HeaderComponent } from '../../../components/header/header.component';

// Generated
import { CommunityService } from '../../../generated';
import { RestResult } from '../../../generated';
import { Community } from '../../../generated';
import { UserService } from '../../../generated';
import { User } from '../../../generated';
import { MyDetailsService } from '../../../generated/api/myDetails.service';
import { Jsonp } from '@angular/http';

declare const $: any;
declare const jQuery: any;

@Component({
  selector: 'app-request-community',
  templateUrl: './request-community.component.html',
  styleUrls: ['./request-community.component.css']
})
export class RequestCommunityComponent implements OnInit {

  @ViewChild(HeaderComponent) header;

  allCommunities: Community[] = [];
  availableCommunities: Community[] = [];
  currentCommunities: Community[] = [];
  requestedCommunities: Community[] = [];
  currentCommunityIds: Set<string> = new Set<string>();
  currentUser: User;
  test: any

  constructor(
    public communityService: CommunityService,
    public userService: UserService,
    private userDetailsService: MyDetailsService) {
  }

  public ngOnInit() {

    jQuery(document).ready(($) => $('#multiselect').multiselect());

    Observable.forkJoin([
      this.communityService.getAll(),
      this.userDetailsService.getCurrentUser()
    ]).subscribe(data => {
      this.allCommunities = data[0].result;
      this.currentUser = data[1].result;

      this.communityService.getByUserIdAndRoleName(this.currentUser.id, 'User').subscribe(roles => {
        this.currentCommunities = roles.result;
        this.requestedCommunities = roles.result;
        this.currentCommunities.forEach((community: Community) => this.currentCommunityIds.add(community.id));
        this.availableCommunities = this.allCommunities.filter( (community: Community) => !this.currentCommunityIds.has(community.id));
      });
    });
  }

  public submit() {
    const selectedCommunityIds: Set<string> = $('#multiselect option').map(function() { return $(this).attr('value')});

    const communityIdsToBeRemoved = Array.from(this.currentCommunityIds.values()).filter( (communityId: string) => !selectedCommunityIds.has(communityId));
    this.removeCommunities(communityIdsToBeRemoved);

    const communityIdsToBeAdded = Array.from(selectedCommunityIds.values()).filter( (communityId: string) => !this.currentCommunityIds.has(communityId));
    this.createAddCommunitiesRequest(communityIdsToBeAdded);
  }

  public cancel() {
    this.requestedCommunities = JSON.parse(JSON.stringify(this.currentCommunities));
  }

  public removeCommunities(comminutyIds : string[]) {
    co
  }

  public createAddCommunitiesRequest(comminutyIds : string[]) {

  }

}
  