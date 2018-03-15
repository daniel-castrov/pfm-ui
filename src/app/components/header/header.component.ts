import { Component, OnInit } from '@angular/core';
import { Response, ResponseContentType } from '@angular/http';
import {
  HttpClient, HttpHeaders, HttpParams,
  HttpResponse, HttpEvent
} from '@angular/common/http';
import { NgbTooltipConfig } from '@ng-bootstrap/ng-bootstrap';
import { Observable } from 'rxjs';
import 'rxjs/add/operator/toPromise';

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

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css'],
  providers: [NgbTooltipConfig]
})

export class HeaderComponent implements OnInit {

  authUser: AuthUser;
  authUserJson: string;
  isloggedin: boolean = false;
  resultError: string[] = [];
  requestLinks: RequestLink[] = [];
  numberOfNotifications = null;

  constructor(
    private blankService: BlankService,
    private myDetailsService: MyDetailsService,
    private createUserRequestService: CreateUserRequestService,
    private joinCommunityRequestService: JoinCommunityRequestService,
    private leaveCommunityRequestService: LeaveCommunityRequestService,
    private userService: UserService,
    private config: NgbTooltipConfig
  ) {
    config.placement = 'left';
  }

  ngOnInit() {
    this.getAutUser();
  }

  getAutUser():void {

    var my: HeaderComponent = this;

    this.blankService.blank("response", true).subscribe(
      (r: HttpResponse<RestResult>) => {
        var authHeader = r.headers.get('Authorization');
        my.authUserJson = atob(authHeader);
        my.authUser = JSON.parse(atob(authHeader));
        my.isloggedin = true;
        if (my.authUser.rolenames.includes('User_Approver')) {
          this.requestLinks = [];
          my.getApproverNotifications();
        }
      });
  }

  getSampleNotifications():void {
    this.requestLinks.push(new RequestLink("Sam Smith", '45243707542', "/user-approval/" + "2222222222", "New User Request"));
    this.requestLinks.push(new RequestLink("Patti Jones", '25204707542', "/user-approval/" + "2222222222", "New User Request"));
    this.requestLinks.push(new RequestLink("Michael McCallaster", '45243707542', "/user-approval/" + "2222222222", "New User Request"));
    this.requestLinks.push(new RequestLink("Amy Awkward", '15209707542', "/community-join/" + "2222222222", "Community Request"));
    this.requestLinks.push(new RequestLink("Violet Vulcan", '85202107542', "/community-leave/" + "2222222222", "Leave Community Request"));
    this.numberOfNotifications = this.requestLinks.length;
  }

  // TO DO Refactor this method.  I tried to use promises and forkJoins but failed.
  getApproverNotifications():void {

    // 1 get the current user
    var resultUser: RestResult;

    this.myDetailsService.getCurrentUser()
      .subscribe((c) => {
        resultUser = c;

        let currentUser = resultUser.result;
        console.log(currentUser.firstName);

        // 2 get the join-community-requests for this approver
        this.joinCommunityRequestService.getByCommId(currentUser.defaultCommunityId)
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
                      user.firstName + " " + user.lastName,
                      request1.dateApplied,
                      "/community-join/" + request1.id,
                      "Community Request"));
                });
            }

            // 3 get the leave-community-requests for this approver
            this.leaveCommunityRequestService.getByCommId(currentUser.defaultCommunityId)
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
                          user.firstName + " " + user.lastName,
                          request2.dateApplied, 
                          "/community-join/" + request2.id, 
                          "Community Request"));
                    });
                }

                // 3b get the new-user-requests for this approver
                this.createUserRequestService.getByCommId(currentUser.defaultCommunityId)
                  .subscribe(r => {

                    // 3c get the usernames for the joins
                    let createUserRequests: CreateUserRequest[] = r.result;
                    for (let request0 of createUserRequests) {
                      this.requestLinks.push(
                        new RequestLink(
                          request0.firstName + " " + request0.lastName, 
                          request0.dateApplied, 
                          "/user-approval/" + request0.id, 
                          "New User Request"));
                    }

                    // LAST Sort and how many notifications are there? If none then null;
                    this.getSampleNotifications();
                    this.requestLinks.sort(this.compareRequsetLink);
                    this.numberOfNotifications = this.requestLinks.length;  
                    if (this.numberOfNotifications <1) {
                      this.numberOfNotifications=null;
                    }
                  });
              });
          });
      });
  }

  compareRequsetLink(a, b) {
    if (a.date < b.date)
      return -1;
    if (a.date > b.date)
      return 1;
    return 0;
  }


}

class RequestLink {
  userId: string;
  name: string;
  date: string;
  link: string;
  type: string;

  constructor(id: string, d: string, l: string, t: string) {
    this.userId = id;
    this.date = d;
    this.link = l;
    this.type = t;
    this.name = id;
  }

}