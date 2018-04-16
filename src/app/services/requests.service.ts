import { Injectable } from '@angular/core';
import { Request } from './request';

// Generated
import { User } from '../generated/model/user';
import { UserService } from '../generated/api/user.service';
import { MyDetailsService } from '../generated/api/myDetails.service';
import { CreateUserRequest } from '../generated/model/createUserRequest';
import { CreateUserRequestService } from '../generated/api/createUserRequest.service';
import { JoinCommunityRequest } from '../generated/model/joinCommunityRequest';
import { JoinCommunityRequestService } from '../generated/api/joinCommunityRequest.service';
import { LeaveCommunityRequest } from '../generated/model/leaveCommunityRequest';
import { LeaveCommunityRequestService } from '../generated/api/leaveCommunityRequest.service';
import { UiLeaveCommunityRequest } from './uiLeaveCommunityRequest';
import { UiJoinCommunityRequest } from './uiJoinCommunityRequest';
import { UiCreateUserRequest } from './uiCreateUserRequest';


@Injectable()
export class RequestsService {

  constructor(
    private myDetailsService: MyDetailsService,
    private createUserRequestService: CreateUserRequestService,
    private joinCommunityRequestService: JoinCommunityRequestService,
    private leaveCommunityRequestService: LeaveCommunityRequestService,
    private userService: UserService
  ) {}
  
  // TO DO Refactor this method.  I tried to use promises and forkJoins but failed.
  getRequests(): Request[] {
    const result: Request[] = [];

    this.myDetailsService.getCurrentUser().subscribe((resultUser) => {
        let currentUser: User = resultUser.result;

        // 2 get the join-community-requests for this approver
        this.joinCommunityRequestService.getByCommId(currentUser.currentCommunityId).subscribe(response => {
            for (let request of response.result as JoinCommunityRequest[]) {

              // 2a get the usernames for the joins
              this.userService.getById(request.userId).subscribe((response) => {
                  let user: User = response.result;
                  result.push(
                    new UiJoinCommunityRequest(
                      request.id,
                      user.firstName + " " + user.lastName,
                      request.dateApplied));
                      this.sortNotifications(result);
                });
            }

            // 3 get the leave-community-requests for this approver
            this.leaveCommunityRequestService.getByCommId(currentUser.currentCommunityId).subscribe(response => {
                // 3a  get the usernames for the leaves
                for (let request of response.result as LeaveCommunityRequest[]) {
                  this.userService.getById(request.userId).subscribe((response) => {
                      let user: User = response.result;
                      result.push(
                        new UiLeaveCommunityRequest(
                          request.id,
                          user.firstName + " " + user.lastName,
                          request.dateApplied));
                          this.sortNotifications(result);
                    });
                }

                // 3b get the new-user-requests for this approver
                this.createUserRequestService.getByCommId(currentUser.currentCommunityId).subscribe(response => {
                    // 3c get the usernames for the joins
                    for (let request of response.result as CreateUserRequest[]) {
                      result.push(
                        new UiCreateUserRequest(
                          request.id,
                          request.firstName + " " + request.lastName,
                          request.dateApplied));
                    }
                    this.sortNotifications(result);
                  });
              });
          });
      });
      return result;
  }

  sortNotifications(requestLinks: Request[]) {
    requestLinks.sort(this.compareRequsetLink);
  }

  compareRequsetLink(a, b) {
    if (a.date < b.date)
      return -1;
    if (a.date > b.date)
      return 1;
    return 0;
  }

}
