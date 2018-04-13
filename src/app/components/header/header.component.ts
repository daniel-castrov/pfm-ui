import { Component, OnInit } from '@angular/core';
import { Response, ResponseContentType } from '@angular/http';
import { HttpResponse } from '@angular/common/http';
import { NgbTooltipConfig } from '@ng-bootstrap/ng-bootstrap';
import { RouterModule, Routes, Router } from '@angular/router';

// Generated
import { AuthUser } from '../../generated/model/authUser';
import { RestResult } from '../../generated/model/restResult';
import { BlankService } from '../../generated/api/blank.service';
import { User } from '../../generated/model/user';
import { UserService } from '../../generated/api/user.service';
import { MyDetailsService } from '../../generated/api/myDetails.service';
import { CreateUserRequest } from '../../generated/model/createUserRequest';
import { CreateUserRequestService } from '../../generated/api/createUserRequest.service';
import { JoinCommunityRequest } from '../../generated/model/joinCommunityRequest';
import { JoinCommunityRequestService } from '../../generated/api/joinCommunityRequest.service';
import { LeaveCommunityRequest } from '../../generated/model/leaveCommunityRequest';
import { LeaveCommunityRequestService } from '../../generated/api/leaveCommunityRequest.service';
import { RequestLinkService } from './requestLink.service';
import { RequestLink } from './requestLink';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss'],
  providers: [NgbTooltipConfig]
})

export class HeaderComponent implements OnInit {

  authUser: AuthUser;
  authUserJson: string;
  isloggedin: boolean = false;
  resultError: string[] = [];
  requestLinks: RequestLink[] = [];
  message: string="";

  constructor(
    private blankService: BlankService,
    private myDetailsService: MyDetailsService,
    private createUserRequestService: CreateUserRequestService,
    private joinCommunityRequestService: JoinCommunityRequestService,
    private leaveCommunityRequestService: LeaveCommunityRequestService,
    private userService: UserService,
    private config: NgbTooltipConfig,
    private requestLinkService:RequestLinkService,
    private router:Router


  ) {
    config.placement = 'left';
    this.requestLinkService.requestLinks.subscribe( (val) => {
    this.requestLinks=val;
    });
    this.message = "";
  }

  ngOnInit(): void {
    this.blankService.blank("response", true).subscribe(
      (r: HttpResponse<RestResult>) => {
        var authHeader = r.headers.get('Authorization');
        this.authUserJson = atob(authHeader);
        this.authUser = JSON.parse(atob(authHeader));
        this.isloggedin = true;

        if ( this.authUser.rolenames.length==0 ){
          console.log(this.authUser.rolenames);
          this.message = `You do not have access to the requested community, your 'Current Community'.
          You might not be a member of that Community (or any Community).<br/>
          Please check your Current Community and or request to join a Community.<br/>
          Please contact an Adminstrator if you need further assistance.`

          this.router.navigate(['my-community'])

        }

        if (this.authUser.rolenames.includes('User_Approver')) {
          this.getApproverNotifications();
        }
      });
  }

  // TO DO Refactor this method.  I tried to use promises and forkJoins but failed.
  getApproverNotifications(): void {

    // 1 get the current user
    var resultUser: RestResult;

    this.myDetailsService.getCurrentUser()
      .subscribe((c) => {
        resultUser = c;
        let currentUser = resultUser.result;

        // 2 get the join-community-requests for this approver
        this.joinCommunityRequestService.getByCommId(currentUser.currentCommunityId)
          .subscribe(r => {
            let joinCommunityRequests = r.result;
            for (let request1 of joinCommunityRequests) {

              // 2a get the usernames for the joins
              this.userService.getById(request1.userId)
                .subscribe((c) => {
                  resultUser = c;
                  this.resultError.push(resultUser.error);
                  let user: User = resultUser.result;
                  this.requestLinks.push(
                    new RequestLink(
                      request1.id,
                      user.firstName + " " + user.lastName,
                      request1.dateApplied,
                      "/community-join/" + request1.id,
                      "Join Community Request"));
                      this.sortNotifications();
                });
            }

            // 3 get the leave-community-requests for this approver
            this.leaveCommunityRequestService.getByCommId(currentUser.currentCommunityId)
              .subscribe(r => {
                // 3a  get the usernames for the leaves
                let leaveCommunityRequests = r.result;
                for (let request2 of leaveCommunityRequests) {
                  this.userService.getById(request2.userId)
                    .subscribe((c) => {
                      resultUser = c;
                      this.resultError.push(resultUser.error);
                      let user: User = resultUser.result;
                      this.requestLinks.push(
                        new RequestLink(
                          request2.id,
                          user.firstName + " " + user.lastName,
                          request2.dateApplied,
                          "/community-leave/" + request2.id,
                          "Leave Community Request"));
                          this.sortNotifications();
                    });
                }


                // 3b get the new-user-requests for this approver
                this.createUserRequestService.getByCommId(currentUser.currentCommunityId)
                  .subscribe(r => {
                    // 3c get the usernames for the joins
                    let createUserRequests: CreateUserRequest[] = r.result;
                    for (let request0 of createUserRequests) {

                      this.requestLinks.push(
                        new RequestLink(
                          request0.id,
                          request0.firstName + " " + request0.lastName,
                          request0.dateApplied,
                          "/user-approval/" + request0.id,
                          "New User Request"));
                    }

                    this.sortNotifications();
                  });
              });
          });
      });
  }

  sortNotifications() {
    this.requestLinks.sort(this.compareRequsetLink);
  }

  compareRequsetLink(a, b) {
    if (a.date < b.date)
      return -1;
    if (a.date > b.date)
      return 1;
    return 0;
  }

}
