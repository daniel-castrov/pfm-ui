import { Component, OnInit, ViewChild } from '@angular/core';
import { HeaderComponent } from '../../../components/header/header.component';
import { Router, ActivatedRoute, Params } from '@angular/router';

// Generated
import { Community } from '../../../generated';
import { CommunityService } from '../../../generated';
import { CreateUserRequest } from '../../../generated/model/createUserRequest';
import { CreateUserRequestService } from '../../../generated/api/createUserRequest.service';
import { RestResult } from '../../../generated/model/restResult';

@Component({
  selector: 'app-user-approval',
  templateUrl: './user-approval.component.html',
  styleUrls: ['./user-approval.component.css']
})
export class UserApprovalComponent implements OnInit {

  @ViewChild(HeaderComponent) header;

  id: string;
  resultError: string[] = [];
  createUserRequest: CreateUserRequest;
  error="";

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    public communityService: CommunityService,
    public createUserRequestService: CreateUserRequestService,
  ) {
    this.route.params.subscribe((params: Params) => {
      this.id = params.id;
    });
  }

  ngOnInit() {
    this.getCreateUserRquest();
  }

  getCreateUserRquest() {

    let result: RestResult;
    this.createUserRequestService.getById(this.id)
      .subscribe(c => {
        result = c;
        this.resultError.push(result.error);
        this.createUserRequest = result.result;

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
    this.submit("\"APPROVED\"");
  }

  deny(){
    this.submit("\"DENIED\"");
  }

  submit(status){
    let result: RestResult;
    this.createUserRequestService.approve(status, this.createUserRequest.id)
      .subscribe(c => {
        result = c;
        this.resultError.push(result.error);       
      });
      location.reload();
      this.router.navigate(['./user-list']); 
  }
}
