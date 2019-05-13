import {Component, OnInit, ViewChild} from '@angular/core';
import {ActivatedRoute, Params, Router} from '@angular/router';
import {CommunityService} from '../../../generated/api/community.service';
import {OrganizationService} from '../../../generated/api/organization.service';
import {CreateUserRequest} from '../../../generated/model/createUserRequest';
import {CreateUserRequestService} from '../../../generated/api/createUserRequest.service';
import {RestResult} from '../../../generated/model/restResult';
import {AppHeaderComponent} from '../../header/app-header/app-header.component';
import {forkJoin} from 'rxjs/internal/observable/forkJoin';

@Component({
  selector: 'app-user-approval',
  templateUrl: './user-approval.component.html',
  styleUrls: ['./user-approval.component.scss']
})
export class UserApprovalComponent implements OnInit {

  @ViewChild(AppHeaderComponent) header: AppHeaderComponent;

  requestId: string;
  resultError;
  createUserRequest: CreateUserRequest;
  error="";

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    public communityService: CommunityService,
    public orgService: OrganizationService,
    public createUserRequestService: CreateUserRequestService
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
        // get the community and organizationthat this request if for
        forkJoin([
          this.communityService.getById(this.createUserRequest.communityId),
          this.orgService.getById(this.createUserRequest.organizationId)
        ]).subscribe( data => {
          this.resultError.push(data[0].error);
          this.createUserRequest.communityId = data[0].result.name;
          this.resultError.push(data[1].error);
          this.createUserRequest.organizationId = data[1].result.abbreviation;
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
    this.createUserRequestService.status(status, this.createUserRequest.id)
      .subscribe(c => {
        this.router.navigate(['./user-list']);
      });
  }
}
