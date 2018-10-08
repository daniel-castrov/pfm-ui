import { Component, OnInit, ViewChild } from '@angular/core';
import { Router, ActivatedRoute, Params } from '@angular/router';
import { Observable } from 'rxjs';

// Other Components
import { HeaderComponent } from '../../header/header.component';
import { NotifyUtil } from '../../../utils/NotifyUtil';

import { Community } from '../../../generated/model/community';
import { CommunityService } from '../../../generated/api/community.service';
import { LeaveCommunityRequestService } from '../../../generated/api/leaveCommunityRequest.service';
import { LeaveCommunityRequest } from '../../../generated/model/leaveCommunityRequest';
import { RestResult } from '../../../generated/model/restResult';
import { User } from '../../../generated/model/user';
import { UserService } from '../../../generated/api/user.service';


@Component({
  selector: 'app-community-leave',
  templateUrl: './community-leave.component.html',
  styleUrls: ['./community-leave.component.css']
})
export class CommunityLeaveComponent implements OnInit {

  @ViewChild(HeaderComponent) header: HeaderComponent;

  requestId: string;
  leaveCommunityRequest: LeaveCommunityRequest;
  requstingUser: User;
  requestedCommunity: Community;
  currentCommunities: Community[] = [];
  resultError;

  constructor(
    private leaveCommunityRequestService: LeaveCommunityRequestService,
    private router: Router,
    private route: ActivatedRoute,
    public communityService: CommunityService,
    public userService: UserService
  ) {

    this.route.params.subscribe((params: Params) => {
      this.requestId = params.requestId;
    });

  }

  ngOnInit() {
    this.resultError = [];
    this.getRequest();
  }


  getRequest(): void {

    // get the request 
    let result: RestResult;
    this.leaveCommunityRequestService.getById(this.requestId)
      .subscribe((c) => {
        result = c;
        this.resultError.push(result.error);
        this.leaveCommunityRequest = result.result;
        if (null == this.leaveCommunityRequest) {
          NotifyUtil.notifyInfo("The requested Leave-Community-Request does not exist");
          return;
        }

        // get the community and user that the request if for,
        // and all the communities the user is a member of 
        Observable.forkJoin([
          this.communityService.getById(this.leaveCommunityRequest.communityId),
          this.userService.getById(this.leaveCommunityRequest.userId),
          this.communityService.getByUserIdAndRoleName(this.leaveCommunityRequest.userId, "User")
        ]).subscribe(data => {

          this.resultError.push(data[0].error);
          this.resultError.push(data[1].error);
          this.resultError.push(data[2].error);

          let com: Community = data[0].result;
          this.leaveCommunityRequest.communityId = com.name;
          this.requstingUser = data[1].result;
          this.currentCommunities = data[2].result;

        });
      });
  }

  approve() {
    this.submit("\"APPROVED\"");
  }

  deny() {
    this.submit("\"DENIED\"");
  }

  async submit(status) {
    try {
      await this.leaveCommunityRequestService.status(status, this.leaveCommunityRequest.id).toPromise();
      this.router.navigate(['./home']);
    } catch(e) {
      NotifyUtil.notifyError(e.message);
    }
  }



}
