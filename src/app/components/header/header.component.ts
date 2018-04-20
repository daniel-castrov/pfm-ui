import { RequestsService } from './../../services/requests.service';
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
import { Request } from '../../services/request';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss'],
  providers: [NgbTooltipConfig]
})
export class HeaderComponent implements OnInit {

  isloggedin: boolean = false;
  authUser: AuthUser;
  requests: Request[] = [];

  constructor(
    private blankService: BlankService,
    private myDetailsService: MyDetailsService,
    private createUserRequestService: CreateUserRequestService,
    private joinCommunityRequestService: JoinCommunityRequestService,
    private leaveCommunityRequestService: LeaveCommunityRequestService,
    private userService: UserService,
    private config: NgbTooltipConfig,
    private requestLinkService:RequestLinkService,
    private requestsService: RequestsService,
    private router:Router
  ) {
      config.placement = 'left';
      this.requestLinkService.requestLinks.subscribe( (val) => {
      this.requests=val;
    });
  }

  async ngOnInit(): Promise<void> {
    const httpResponse: HttpResponse<RestResult> = await this.blankService.blank("response", true).toPromise();
    const authHeader = httpResponse.headers.get('Authorization');
    this.authUser = JSON.parse(atob(authHeader));
    this.isloggedin = true;
    
    if (!this.authUser.currentCommunity) {
      this.router.navigate(['my-community'])
    }
    
    if (this.authUser.rolenames.includes('User_Approver')) {
      this.requests = this.requestsService.getRequests();
    } else {
      this.requests = [];
    }
  }

}
