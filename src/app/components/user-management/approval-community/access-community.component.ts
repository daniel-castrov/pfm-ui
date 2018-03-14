import { Component, OnInit, ViewChild  } from '@angular/core';
import { Router, ActivatedRoute, Params } from '@angular/router';

// Other Components
import { HeaderComponent } from '../../../components/header/header.component';

import { Community } from '../../../generated/model/community';
import { CommunityService } from '../../../generated/api/community.service';
import { JoinCommunityRequestService } from '../../../generated/api/joinCommunityRequest.service';
import { JoinCommunityRequest } from '../../../generated/model/joinCommunityRequest';
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

  requestId:string;
  joinCommunityRequest:JoinCommunityRequest;
  requstingUser:User;
  requestedCommunity:Community;
  currentCommunities:Community[]=[];
  resultError: string[] = [];

  constructor(
    private joinCommunityRequestService:JoinCommunityRequestService,
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

// 1 get the requets
// 2 get the user that the request if for
// 3 get all the communities that the user is in
// 4 get the community the request is for.

    // get the request 
    let result: RestResult;
    this.joinCommunityRequestService.getById(this.requestId)
    .subscribe( (c) => {
      result = c;
      this.resultError.push(result.error);
      this.joinCommunityRequest=result.result;


      // get the community that this request if for
      let result2: RestResult;
      this.communityService.getById(this.joinCommunityRequest.communityId)
        .subscribe(c => {
          result2 = c;
          this.resultError.push(result2.error);
          let com: Community = result2.result;
          this.joinCommunityRequest.communityId = com.name;

          // get the user
          let result3: RestResult;    
          this.userService.getById(this.joinCommunityRequest.userId)
          .subscribe( (c) => {
            result3 = c;
            this.resultError.push(result3.error);
            this.requstingUser=result3.result;


            // get this users communities.
            let result4: RestResult;    
            this.communityService.getByUserIdAndRoleName(this.joinCommunityRequest.userId, "User")
            .subscribe ( (c) => {
              result4 = c;
              this.resultError.push(result4.error);

              this.currentCommunities = result4.result;

            });

          });
        });
    });
  }

 approve(){
    this.submit("\"APPROVED\"");
  }

  deny(){
    this.submit("\"DENIED\"");
  }

  submit(status){

    let result: RestResult;
    this.joinCommunityRequestService.approve(status, this.joinCommunityRequest.id )
    .subscribe ( (c) => {
      result = c;
      this.resultError.push(result.error);   
      this.router.navigate(['./home']); 
      location.reload();
    });

  }
}
