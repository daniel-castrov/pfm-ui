import { Component, OnInit, AfterViewInit } from '@angular/core';
import { Input } from '@angular/core';
import { Router, ActivatedRoute, Params } from '@angular/router';
import { Response, ResponseContentType } from '@angular/http';

// Generated
import { AuthUser } from '../../generated/model/authUser';
import { RestResult } from '../../generated/model/restResult';
import { BlankService } from '../../generated/api/blank.service';
import { User } from '../../generated/model/user';
import { MyDetailsService } from '../../generated/api/myDetails.service';
import { CreateUserRequest } from '../../generated/model/createUserRequest';
import { CreateUserRequestService } from '../../generated/api/createUserRequest.service';
import { AddUserToCommunityRequestService } from '../../generated/api/addUserToCommunityRequest.service';
import { AddUserToCommunityRequest } from '../../generated/model/addUserToCommunityRequest';



import {
  HttpClient, HttpHeaders, HttpParams,
  HttpResponse, HttpEvent
} from '@angular/common/http';

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
  addUserToCommunityRequest:AddUserToCommunityRequest[]=[];
  numberOfNotifications=null;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private blankService: BlankService,
    private myDetailsService: MyDetailsService,
    private createUserRequestService: CreateUserRequestService,
    private addUserToCommunityRequestService:AddUserToCommunityRequestService,
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
        //console.log("Current authHeader: " + authHeader);
        this.authUserJson = atob(authHeader);
        //console.log("Current json: " +this.authUserJson);
        this.authUser = JSON.parse(atob(authHeader));
        //console.log("Current User: " + this.authUser.fullName);
        this.isloggedin = true;

        if (this.authUser.rolenames.includes('User_Approver')) {
          this.getApproverNotifications();
        }
      });
  }

  getApproverNotifications() {

    var resultUser: RestResult;
    this.myDetailsService.getCurrentUser()
      .subscribe((c) => {
        resultUser = c;
        this.user = resultUser.result;
        console.log(this.user.firstName);

        let resultNUR: RestResult;
        let s = this.createUserRequestService.getByCommId(this.user.defaultCommunityId);
        s.subscribe(c => {
          resultNUR = c;
          this.resultError.push(resultNUR.error);
          this.createUserRequests = resultNUR.result;
          this.numberOfNotifications = this.createUserRequests.length;

          let resultCR: RestResult;
          this.addUserToCommunityRequestService.getByCommId(this.user.defaultCommunityId)
          .subscribe ( (c) => {
            resultCR=c;
            this.resultError.push(resultCR.error);
            this.addUserToCommunityRequest = resultCR.result;
            this.numberOfNotifications += this.addUserToCommunityRequest.length;
  
            // How many notifications are there? If none then null;
            if (this.numberOfNotifications <1) {
              this.numberOfNotifications=null;
            }
          });

        });
      });
  }
}
