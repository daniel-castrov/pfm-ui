import { UserRole } from './../../../generated/model/userRole';
import { AddUserToCommunityRequest } from './../../../generated/model/addUserToCommunityRequest';
import { AddUserToCommunityRequestService } from './../../../generated/api/addUserToCommunityRequest.service';
import { UserRoleService } from './../../../generated/api/userRole.service';
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
import { Router, ActivatedRoute, Params } from '@angular/router';


declare const $: any;
declare const jQuery: any;

@Component({
  selector: 'app-request-community',
  templateUrl: './request-community.component.html',
  styleUrls: ['./request-community.component.css']
})
export class RequestCommunityComponent implements OnInit {

  @ViewChild(HeaderComponent) header;

  isFirstOpen = true;

  allCommunities: Community[] = [];
  availableCommunities: Community[] = [];
  currentCommunities: Community[] = [];
  requestedCommunities: Community[] = [];
  currentCommunityIds: Set<string> = new Set<string>();
  currentUser: User;
  test: any

  constructor(
    private router: Router,
    private communityService: CommunityService,
    private userService: UserService,
    private userRoleService: UserRoleService,
    private addUserToCommunityRequestsService: AddUserToCommunityRequestService,
    private userDetailsService: MyDetailsService) {
  }

  public ngOnInit() {

    // jQuery(document).ready(($) => $('#multiselect').multiselect());

    // Alert box message
    jQuery(".alert").alert('close');

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
    const selectedCommunityIds: Set<string> = new Set<string>($('#multiselect option').map(function() { return $(this).attr('value')}).toArray());

    const communityIdsToBeRemoved: string[] = this.subtract(this.currentCommunityIds, selectedCommunityIds);
    this.removeCommunities(communityIdsToBeRemoved);

    const communityIdsToBeAdded: string[] = this.subtract(selectedCommunityIds, this.currentCommunityIds);
    this.createAddCommunitiesRequest(communityIdsToBeAdded);

    this.router.navigate(['./home']);
  }

  public cancel() {
    this.requestedCommunities = JSON.parse(JSON.stringify(this.currentCommunities));
  }

  private subtract(first: Set<string>, second: Set<string>) : string[] {
    return Array.from(first).filter( (element: string) => {
      return !second.has(element);
    });
  }

  private removeCommunities(communityIds : string[]) {
    communityIds.forEach(communityId => {
      this.userRoleService.getUserRolesbyUserAndCommunityAndRoleName(this.currentUser.id, communityId, "User").subscribe( result => {
         this.userRoleService.deleteById(result.result.id).subscribe();
     });
    });
  }

  private createAddCommunitiesRequest(communityIds : string[]) {
    communityIds.forEach(communityId => {
      const request: AddUserToCommunityRequest = {};
      request.userId = this.currentUser.id;
      request.communityId = communityId;
      console.log(request);
      this.addUserToCommunityRequestsService.create(request).subscribe()
    });
  }

}
