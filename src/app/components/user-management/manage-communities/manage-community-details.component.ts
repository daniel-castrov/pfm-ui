import { AccordionModule } from 'ngx-bootstrap/accordion';
import { Component, OnInit, ViewChild } from '@angular/core';
import { Observable } from 'rxjs';
import { Router, ActivatedRoute, Params } from '@angular/router';

// Other Components
import { HeaderComponent } from '../../header/header.component';

// Generated
import { User } from '../../../generated/model/user';
import { RestResult } from '../../../generated/model/restResult';
import { CommunityService } from '../../../generated/api/community.service';
import { Community } from '../../../generated/model/community';
import { Organization } from '../../../generated/model/organization';
import { UserService } from '../../../generated/api/user.service';
import { Role } from '../../../generated/model/role'
import { RoleService } from '../../../generated/api/role.service';
import { UserRoleResource } from '../../../generated/model/userRoleResource'
import { UserRoleResourceService } from '../../../generated/api/userRoleResource.service';
import { OrganizationService } from '../../../generated/api/organization.service';

@Component({
  selector: 'app-manage-community-details',
  templateUrl: './manage-community-details.component.html',
  styleUrls: ['./manage-community-details.component.scss']
})
export class MamageCommunityDetailsComponent implements OnInit {

  @ViewChild(HeaderComponent) header;

  // This is the id of the community we are interested in 
  id: string;

  approvers: User[]=[];
  addedapprover:string;
  resultError:string[]=[];
  community: Community;
  users:User[]=[];
  organizations:Organization[]=[];

  programs: string[]=[];

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private userService: UserService,
    private communityService: CommunityService,
    private roleService:RoleService,
    private userRoleResourceService:UserRoleResourceService,
    private organizationService:OrganizationService

  ) {
    this.route.params.subscribe((params: Params) => {
      this.id = params.id;
    });

  }

  ngOnInit() {
    this.resultError;
    this.getCommunity();
    this.getUsers();
  }

  private getCommunity(): void {
    this.approvers=[];

    let result: RestResult;

    Observable.forkJoin([
      this.communityService.getById(this.id),
      this.userService.getByCommunityIdAndRoleName(this.id,"User_Approver"),
      this.organizationService.getByCommunityId(this.id)
    ]).subscribe(data => {

      this.resultError.push(data[0].error);
      this.resultError.push(data[1].error);
      this.resultError.push(data[2].error);

      this.community = data[0].result;
      if ( null==this.community ){
        this.resultError.push("The requested Community does not exist");
        return;
      }
      console.log(this.community );

      this.approvers = data[1].result;

      this.organizations = data[2].result;

    });
  }

  getUsers(): void{
    let result:RestResult;
    this.userService.getAll()
    .subscribe(c => {
      result = c;
      this.resultError.push(result.error);
      this.users=result.result;
    });
  }

  private addApprover():void {

    let approverRole:Role;
    let resultRole: RestResult;
    this.roleService.getByNameAndCommunityId(this.id,"User_Approver")
    .subscribe(r => {
      resultRole = r;
      this.resultError.push(resultRole.error);
      approverRole = resultRole.result;
      let userRoleResource:UserRoleResource=new Object();
      userRoleResource.roleId=approverRole.id;
      userRoleResource.userId=this.addedapprover;

      let resultUserRole: RestResult;
      this.userRoleResourceService.create(userRoleResource)
      .subscribe(r => {
        resultRole = r;
        this.getCommunity();
      });
    });
  }

}
