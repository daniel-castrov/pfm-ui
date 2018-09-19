import { Component, OnInit, ViewChild } from '@angular/core';
import { Observable } from 'rxjs';
import { ActivatedRoute, Params } from '@angular/router';

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
  communityid: string;

  approvers: User[]=[];
  addedapprover:string;
  resultError:string[]=[];
  community: Community;
  users:User[]=[];
  organizations:Organization[]=[];
  newOrg:Organization = new Object();

  programs: string[]=[];

  constructor(
    private route: ActivatedRoute,
    private userService: UserService,
    private communityService: CommunityService,
    private roleService:RoleService,
    private userRoleResourceService:UserRoleResourceService,
    private organizationService:OrganizationService

  ) {
    this.route.params.subscribe((params: Params) => {
      this.communityid = params.id;
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
      this.communityService.getById(this.communityid),
      this.userService.getByCommunityIdAndRoleName(this.communityid,"User_Approver"),
      this.organizationService.getByCommunityId(this.communityid)
    ]).subscribe(data => {

      this.resultError.push(data[0].error);
      this.resultError.push(data[1].error);
      this.resultError.push(data[2].error);

      this.community = data[0].result;
      if ( null==this.community ){
        this.resultError.push("The requested Community does not exist");
        return;
      }
      this.approvers = data[1].result;
      this.organizations = data[2].result;

    });
  }

  getUsers(): void{
    let result:RestResult;
    this.userService.getByCommId(this.communityid)
    .subscribe(c => {
      result = c;
      this.resultError.push(result.error);
      this.users=result.result;
    });
  }

  private addApprover():void {

    let approverRole:Role;
    let resultRole: RestResult;
    this.roleService.getByNameAndCommunityId(this.communityid,"User_Approver")
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

  private addOrganization():void {

    if (!this.isNewOrgValid()) {
      let errorString = "The new organization name or identifier is not unique";
      console.log(errorString);
      this.resultError.push(errorString);
    } else {
      this.newOrg.communityId = this.communityid;
      this.organizationService.create(this.newOrg)
      .subscribe(r => {    
          this.resultError.push(r.error);
          this.newOrg = r.result;
        });
      this.organizations.push(this.newOrg);
    }
  }

  private isNewOrgValid(){
    let org: Organization;
    for (org of this.organizations) {
      if (org.name === this.newOrg.name ||
        org.abbreviation === this.newOrg.abbreviation) {
        return false;
      }
    }
    return true;
  }


}
