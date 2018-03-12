import { Component, OnInit, AfterViewInit } from '@angular/core';
import { Input } from '@angular/core';
import { Router, ActivatedRoute, Params } from '@angular/router';
import { Response, ResponseContentType } from '@angular/http';
import {
  HttpClient, HttpHeaders, HttpParams,
  HttpResponse, HttpEvent
} from '@angular/common/http';

// Generated
import { AuthUser } from '../../generated/model/authUser';
import { RestResult } from '../../generated/model/restResult';
import { BlankService } from '../../generated/api/blank.service';
import { User } from '../../generated/model/user';
import { UserService } from '../../generated/api/user.service'; 
import { MyDetailsService } from '../../generated/api/myDetails.service';
import { CreateUserRequest } from '../../generated/model/createUserRequest';
import { CreateUserRequestService } from '../../generated/api/createUserRequest.service';
import { AddUserToCommunityRequest } from '../../generated/model/addUserToCommunityRequest';
import { AddUserToCommunityRequestService } from '../../generated/api/addUserToCommunityRequest.service';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css']
})

export class HeaderComponent implements OnInit {

  authUser: AuthUser;
  authUserJson: string;
  isloggedin: boolean = false;
  user: User;
  resultError: string[] = [];
  createUserRequests: CreateUserRequest[] = [];
  //addUserToCommunityRequests:AddUserToCommunityRequest[]=[];
  commRequestWithUsers:CommRequestWithUser[]=[];
  numberOfNotifications=null;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private blankService: BlankService,
    private myDetailsService: MyDetailsService,
    private createUserRequestService: CreateUserRequestService,
    private addUserToCommunityRequestService:AddUserToCommunityRequestService,
    private userService:UserService
  ) {
  }

  ngOnInit() {
    this.getAutUser();
  }

  ngAfterViewInit() {
  }

  getAutUser() {
    this.blankService.blank("response", true).subscribe(
      (r: HttpResponse<RestResult>) => {
        var authHeader = r.headers.get('Authorization');
        this.authUserJson = atob(authHeader);
        this.authUser = JSON.parse(atob(authHeader));
        this.isloggedin = true;
        if (this.authUser.rolenames.includes('User_Approver')) {
          this.getApproverNotifications();
        }
      });
  }

  getApproverNotifications() {

    // 1 get the current user
    var resultUser: RestResult;
    this.myDetailsService.getCurrentUser()
      .subscribe((c) => {
        resultUser = c;
        this.user = resultUser.result;
        console.log(this.user.firstName);

        // 2 get the current user's new-user-requests (for the default community) 
        let resultNUR: RestResult;
        let s = this.createUserRequestService.getByCommId(this.user.defaultCommunityId);
        s.subscribe(c => {
          resultNUR = c;
          this.resultError.push(resultNUR.error);
          this.createUserRequests = resultNUR.result;

          // How many notifications are there?
          this.numberOfNotifications = this.createUserRequests.length;

          // 3 get the current user's community-requests (for the default community) 
          let resultCR: RestResult;
          this.addUserToCommunityRequestService.getByCommId(this.user.defaultCommunityId)
          .subscribe ( (c) => {
            resultCR=c;
            this.resultError.push(resultCR.error);
            let addUserToCommunityRequests = resultCR.result;
           
            this.numberOfNotifications += addUserToCommunityRequests.length;  
            // How many notifications are there? If none then null;
            if (this.numberOfNotifications <1) {
              this.numberOfNotifications=null;
            }

            // 4 get usernames for each community-requests
            for ( let request of addUserToCommunityRequests  ){
              let resultUser: RestResult;
              this.userService.getById(request.userId)
              .subscribe ((c) => {
                resultUser=c;
                this.resultError.push(resultUser.error);
                this.commRequestWithUsers.push(new CommRequestWithUser( resultUser.result , request.id ) );
              })
            }
          });
        });
      });
  }
}

class CommRequestWithUser {
  user: User;
  requestId:string; 
  constructor(u: User, r: string) {
    this.user = u;
    this.requestId = r;
  }
}


