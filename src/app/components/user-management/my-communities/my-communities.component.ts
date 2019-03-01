import {JoinCommunityRequestService} from '../../../generated/api/joinCommunityRequest.service';
import {LeaveCommunityRequestService} from '../../../generated/api/leaveCommunityRequest.service';
import {Component, OnInit, ViewChild} from '@angular/core';
import {Observable} from 'rxjs';
import {Community, CommunityService, User} from '../../../generated';
import {MyDetailsService} from '../../../generated/api/myDetails.service';
import {AppHeaderComponent} from "../../header/app-header/app-header.component";

@Component({
  selector: 'app-request-community',
  templateUrl: './my-communities.component.html',
  styleUrls: ['./my-communities.component.scss']
})
export class MyCommunitiesComponent implements OnInit {

  @ViewChild(AppHeaderComponent) header: AppHeaderComponent;

  allCommunities: Community[] = [];
  communitiesToJoin: Community[] = [];
  communitiesToLeave: Community[] = [];
  memberOfCommunities: Community[] = [];
  currentCommunityIds: Set<string> = new Set<string>();
  user: User;

  constructor(
    private communityService: CommunityService,
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
        this.communitiesToLeave = roles.result;
        this.communitiesToLeave.forEach((community: Community) => this.currentCommunityIds.add(community.id));
        this.memberOfCommunities = this.communitiesToLeave;
        this.communitiesToJoin = this.allCommunities.filter( (community: Community) => !this.currentCommunityIds.has(community.id));
      });
    });
  }

}
