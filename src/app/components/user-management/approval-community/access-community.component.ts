import { Component, OnInit, ViewChild  } from '@angular/core';
import { Router, ActivatedRoute, Params } from '@angular/router';

// Other Components
import { HeaderComponent } from '../../../components/header/header.component';

import { AddUserToCommunityRequestService } from '../../../generated/api/addUserToCommunityRequest.service';
import { AddUserToCommunityRequest } from '../../../generated/model/addUserToCommunityRequest';
import { Community } from '../../../generated/model/community';
import { CommunityService } from '../../../generated/api/community.service';
import { RestResult } from '../../../generated/model/restResult';
import { User } from '../../../generated/model/user';
import { UserService } from '../../../generated/api/user.service';


@Component({
  selector: 'app-access-community',
  templateUrl: './access-community.component.html',
  styleUrls: ['./access-community.component.css']
})
export class AccessCommunityComponent implements OnInit {

  @ViewChild(HeaderComponent) header;

  addUserToCommunityRequest:AddUserToCommunityRequest;
  requestId:string;
  resultError: string[] = [];

  constructor(
    private addUserToCommunityRequestService:AddUserToCommunityRequestService,
    private router: Router,
    private route: ActivatedRoute,
    public communityService: CommunityService,
    public userService: UserService,
  ) { 

    this.route.params.subscribe((params: Params) => {
      this.requestId = params.id;
    });

  }

  ngOnInit() {
    this.getRequest();
  }


  getRequest(): void {

    let result: RestResult;
    this.addUserToCommunityRequestService.getById(this.requestId)
    .subscribe( (c) => {
      result = c;
      this.resultError.push(result.error);
      this.addUserToCommunityRequest=result.result;


      // get the community that this request if for
      let result2: RestResult;
      this.communityService.getById(this.addUserToCommunityRequest.communityId)
        .subscribe(c => {
          result2 = c;
          this.resultError.push(result2.error);
          let com: Community = result2.result;
          this.addUserToCommunityRequest.communityId = com.name;

          let result3: RestResult;    
          this.userService.getById(this.addUserToCommunityRequest.userId)
          .subscribe( (c) => {
            result3 = c;
            this.resultError.push(result3.error);
            let user:User;
            user=result3.result;
          });
        });
    });
  }

  do(){

    this.addUserToCommunityRequest.communityId;
    this.addUserToCommunityRequest.dateApplied
    this.addUserToCommunityRequest.dateDecided
    this.addUserToCommunityRequest.status
    this.addUserToCommunityRequest.userId
    this.addUserToCommunityRequest.id


  }

}
