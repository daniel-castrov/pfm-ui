import { JoinCommunityRequestService } from './../../../generated/api/joinCommunityRequest.service';
import { LeaveCommunityRequestService } from './../../../generated/api/leaveCommunityRequest.service';
import { UserRoleService } from './../../../generated/api/userRole.service';
import { Component, OnInit, ViewChild } from '@angular/core';
import { Observable } from 'rxjs';

// Generated
import { CommunityService } from '../../../generated';
import { Community } from '../../../generated';
import { User } from '../../../generated';
import { MyDetailsService } from '../../../generated/api/myDetails.service';

@Component({
  selector: 'app-request-community',
  templateUrl: './my-communities.component.html',
  styleUrls: ['./my-communities.component.css']
})
export class MyCommunitiesComponent implements OnInit {

  allCommunities: Community[] = [];
  availableCommunities: Community[] = [];
  memberOfCommunities: Community[] = [];
  requestedCommunities: Community[] = [];
  currentCommunityIds: Set<string> = new Set<string>();
  user: User;

  constructor(
    private communityService: CommunityService,
    private userRoleService: UserRoleService,
    private joinCommunityRequestsService: JoinCommunityRequestService,
    private leaveCommunityRequestsService: LeaveCommunityRequestService,
    private myDetailsService: MyDetailsService) {
  }

  public ngOnInit() {
    Observable.forkJoin([
      this.communityService.getAll(),
      this.myDetailsService.getCurrentUser()
    ]).subscribe(data => {
      this.allCommunities = data[0].result;
      this.user = data[1].result;

      this.communityService.getByUserIdAndRoleName(this.user.id, 'User').subscribe(roles => {
        this.memberOfCommunities = roles.result;
        this.requestedCommunities = roles.result;
        this.memberOfCommunities.forEach((community: Community) => this.currentCommunityIds.add(community.id));
        this.availableCommunities = this.allCommunities.filter( (community: Community) => !this.currentCommunityIds.has(community.id));
      });
    });
  }

}
