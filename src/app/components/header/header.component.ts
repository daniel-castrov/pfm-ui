import { Component, OnInit } from '@angular/core';
import { Response, ResponseContentType } from '@angular/http';
import {
  HttpClient, HttpHeaders, HttpParams,
  HttpResponse, HttpEvent
} from '@angular/common/http';
import {NgbTooltipConfig} from '@ng-bootstrap/ng-bootstrap';

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
  requestLinks:RequestLink[]=[];
  numberOfNotifications=null;

  constructor(
    private blankService: BlankService,
    private myDetailsService: MyDetailsService,
    private createUserRequestService: CreateUserRequestService,
    private joinCommunityRequestService:JoinCommunityRequestService,
    private userService:UserService,
    private config: NgbTooltipConfig
  ) {
    config.placement = 'left';
  }

  ngOnInit() {
    this.getAutUser();
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
          this.requestLinks.sort(this.compareRequsetLink);
        }
      });
  }

  getApproverNotifications() {
    
    // this.requestLinks.push(new RequestLink( "Sam Smith" , '45243707542', "/user-approval/"+"2222222222", "New User Request"));
    // this.requestLinks.push(new RequestLink( "Patti Jones" , '25204707542', "/user-approval/"+"2222222222", "New User Request" ));
    // this.requestLinks.push(new RequestLink( "Michael McCallaster" , '45243707542', "/user-approval/"+"2222222222", "New User Request" ));
    // this.requestLinks.push(new RequestLink( "Amy Awkward" , '15209707542', "/access-community/"+"2222222222", "Community Request" ));
    // this.requestLinks.push(new RequestLink( "Violet Vulcan" , '85202107542', "/access-community/"+"2222222222", "Community Request" ));
    // this.numberOfNotifications = this.requestLinks.length;  

    // 1 get the current user
    var resultUser: RestResult;

    this.myDetailsService.getCurrentUser()
      .subscribe((c) => {
        resultUser = c;

        let user = resultUser.result;
        console.log(user.firstName);

        // 2 get the current user's new-user-requests (for the default community) 
        let resultNUR: RestResult;
        let s = this.createUserRequestService.getByCommId(user.defaultCommunityId);
        s.subscribe(c => {
          resultNUR = c;
          this.resultError.push(resultNUR.error);
          let createUserRequests:CreateUserRequest[] = resultNUR.result;
          for ( let request of createUserRequests  ){
            this.requestLinks.push(
              new RequestLink( request.firstName + " " + request.lastName , request.dateApplied, "/user-approval/"+request.id, "New User Request" ) 
            );
          }

          // 3 get the current user's community-requests (for the default community) 
          let resultCR: RestResult;
          this.joinCommunityRequestService.getByCommId(user.defaultCommunityId)
          .subscribe ( (c) => {
            resultCR=c;
            this.resultError.push(resultCR.error);
            let joinCommunityRequests = resultCR.result;

            // 4 get usernames for each community-requests
            for ( let request of joinCommunityRequests  ){
              let resultUser: RestResult;
              this.userService.getById(request.userId)
              .subscribe ((c) => {
                resultUser=c;
                this.resultError.push(resultUser.error);
                let user:User = resultUser.result;
                this.requestLinks.push(
                  new RequestLink( user.firstName + " " + user.lastName , request.dateApplied, "/access-community/"+request.id, "Community Request" ) 
                );
             
                // How many notifications are there? If none then null;
                this.numberOfNotifications = this.requestLinks.length;  
                if (this.numberOfNotifications <1) {
                  this.numberOfNotifications=null;
                }
              });
            }
          });
        });
      });
  }

 compareRequsetLink(a,b) {
    if (a.date < b.date)
      return -1;
    if (a.date > b.date)
      return 1;
    return 0;
  }


}

class RequestLink {
  name:string;
  date:string;
  link:string;
  type:string;
  constructor(u: string, d:string, l: string, t:string) {
    this.name = u;
    this.date = d;
    this.link = l;
    this.type = t;
  }
}


