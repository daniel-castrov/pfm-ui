import { Component, OnInit, ViewChild } from '@angular/core';
import { HeaderComponent } from '../../../components/header/header.component';
import { Router, ActivatedRoute, Params } from '@angular/router';

// Generated
import { Community } from '../../../generated/model/community';
import { CommunityService } from '../../../generated/api/community.service';
import { CreateUserRequest } from '../../../generated/model/createUserRequest';
import { CreateUserRequestService } from '../../../generated/api/createUserRequest.service';
import { RestResult } from '../../../generated/model/restResult';
import { RequestLinkService } from '../../header/requestLink.service';
import { Request } from '../../../services/request';

@Component({
  selector: 'app-user-approval',
  templateUrl: './user-approval.component.html',
  styleUrls: ['./user-approval.component.scss']
})
export class UserApprovalComponent implements OnInit {

  @ViewChild(HeaderComponent) header: HeaderComponent;

  requestId: string;
  resultError;
  createUserRequest: CreateUserRequest;
  error="";

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    public communityService: CommunityService,
    public createUserRequestService: CreateUserRequestService,
    public requestLinkService: RequestLinkService
  ) {
    this.route.params.subscribe((params: Params) => {
      this.requestId = params.requestId;
    });
  }

  ngOnInit() {
    this.resultError=[];
    this.getCreateUserRquest();
  }

  getCreateUserRquest() {

    // get the request
    let result: RestResult;
    this.createUserRequestService.getById(this.requestId)
      .subscribe(c => {
        result = c;
        this.resultError.push(result.error);
        this.createUserRequest = result.result;
        if ( null==this.createUserRequest ){
          this.resultError.push("The requested New-User-Application does not exist");
          return;
        }

        // get the community that this request if for
        let result2: RestResult;
        this.communityService.getById(this.createUserRequest.communityId)
          .subscribe(c => {
            result2 = c;
            this.resultError.push(result2.error);
            let com: Community = result2.result;
            this.createUserRequest.communityId = com.name;
          });
      });
  }

  approve(){
    let my: UserApprovalComponent = this;
    let reqLinks:Request[];
    reqLinks = my.header.requests.filter(
      function (el) { return el.requestId !== my.requestId }
    );

    this.requestLinkService.requestLinks.next(reqLinks);

    this.submit("\"APPROVED\"");
  }

  deny(){
    this.submit("\"DENIED\"");
  }

  submit(status){
    let result: RestResult;
    this.createUserRequestService.status(status, this.createUserRequest.id)
      .subscribe(c => {
        result = c;
        this.resultError.push(result.error);
        this.router.navigate(['./user-list']);
      });
  }
}
