import { Component, OnInit, ViewChild } from '@angular/core';
import { Router, ActivatedRoute, Params } from '@angular/router';
import { Observable } from 'rxjs';

// Other Components
import { HeaderComponent } from '../../../components/header/header.component';

import { Community } from '../../../generated/model/community';
import { CommunityService } from '../../../generated/api/community.service';
import { JoinCommunityRequestService } from '../../../generated/api/joinCommunityRequest.service';
import { JoinCommunityRequest } from '../../../generated/model/joinCommunityRequest';
import { RestResult } from '../../../generated/model/restResult';
import { User } from '../../../generated/model/user';
import { UserService } from '../../../generated/api/user.service';
import { FeedbackComponent } from '../../feedback/feedback.component';

@Component({
  selector: 'app-community-join',
  templateUrl: './community-join.component.html',
  styleUrls: ['./community-join.component.css'],

})
export class CommunityJoinComponent implements OnInit {

  @ViewChild(HeaderComponent) header: HeaderComponent;
  @ViewChild(FeedbackComponent) feedback: FeedbackComponent;

  requestId: string;
  joinCommunityRequest: JoinCommunityRequest;
  requstingUser: User;
  requestedCommunity: Community;
  currentCommunities: Community[] = [];
  resultError;

  constructor(
    private joinCommunityRequestService: JoinCommunityRequestService,
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
    this.joinCommunityRequestService.getById(this.requestId)
      .subscribe((c) => {
        result = c;
        this.resultError.push(result.error);
        this.joinCommunityRequest = result.result;

        if (null == this.joinCommunityRequest) {
          this.resultError.push("The requested Join-Community-Request does not exist");
          return;
        }

        // get the community and user that the request if for,
        // and all the communities the user is a member of 
        Observable.forkJoin([
          this.communityService.getById(this.joinCommunityRequest.communityId),
          this.userService.getById(this.joinCommunityRequest.userId),
          this.communityService.getByUserIdAndRoleName(this.joinCommunityRequest.userId, "User")
        ]).subscribe(data => {

          this.resultError.push(data[0].error);
          this.resultError.push(data[1].error);
          this.resultError.push(data[2].error);

          let com: Community = data[0].result;
          this.joinCommunityRequest.communityId = com.name;
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
      await this.joinCommunityRequestService.status(status, this.joinCommunityRequest.id).toPromise();
      this.router.navigate(['./home']);
    } catch(e) {
      this.feedback.exception(e.message);
    }
  }

}
