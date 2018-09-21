import { Component, OnInit, ViewChild } from '@angular/core';
import { Router, ActivatedRoute, Params } from '@angular/router';
// import {
//   HttpClient, HttpHeaders, HttpParams,
//   HttpResponse, HttpEvent
// } from '@angular/common/http';

import { Observable } from 'rxjs';
// import { Response, ResponseContentType } from '@angular/http';

// Other Components
import { HeaderComponent } from '../../header/header.component';

// Generated
import { User } from '../../../generated/model/user';
import { RestResult } from '../../../generated/model/restResult';
import { CommunityService } from '../../../generated/api/community.service';
import { OrganizationService } from '../../../generated/api/organization.service';
import { Organization } from '../../../generated/model/organization';
import { Community } from '../../../generated/model/community';
import { UserService } from '../../../generated/api/user.service';
import { Role } from '../../../generated/model/role';
import { RoleService } from '../../../generated/api/role.service';
import { UserRoleResource } from '../../../generated/model/userRoleResource';
import { UserRoleResourceService } from '../../../generated/api/userRoleResource.service';

@Component({
  selector: 'app-manage-users',
  templateUrl: './manage-users.component.html',
  styleUrls: ['./manage-users.component.scss']
})
export class ManageUsersComponent implements OnInit {

  @ViewChild(HeaderComponent) header;

  // This is the id of the user we are interested in ... the targetUser
  userid: string;

  // The user we are interested in.
  targetUser: User;

  // this user's roles and all roles in a community
  private communityWithUserRoles: CommWithRoles[] = [];

  // The name of the role we are assigning the targetUser to
  addedroleId: string;

  // The name of the community we are assigning the targetUser to
  selectedJoinCommunity: Community;

  // All the communities the user does not belong to
  availCommunities: Community[] = [];

  // all organizations of a selected community
  organizations: Organization[] = [];

  // an organization that was selected
  selectedOrganization: Organization;

  // an original copy of the targted user so we can roll back.
  reftargetUser: User;

  // Have we hit the edit button or are we just viewing?
  isdEditMode: boolean[] = [];

  // Any error from a rest service
  resultError: string[]=[];

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private userService: UserService,
    private roleService: RoleService,
    private communityService: CommunityService,
    private userRoleResourceService: UserRoleResourceService,
    private organizationService: OrganizationService

  ) {
    this.route.params.subscribe((params: Params) => {
      this.userid = params.id;
    });
  }

  ngOnInit() {
    this.getTargetUser();
    this.resetEditMode();
  }


  getTargetUser(): void {
    Observable.forkJoin([
      this.userService.getById(this.userid),
      this.communityService.getAll(),
    ]).subscribe(data => {

      this.resultError.push(data[0].error);
      this.targetUser = data[0].result;

      let allCommunities: Community[] = [];
      let resultComm: RestResult;

      this.resultError.push(data[1].error);
      allCommunities = data[1].result;

      for (let comm of allCommunities) {
        let resultUserRoleResources: RestResult;
        let s = this.roleService.getByUserIdAndCommunityId(this.targetUser.id, comm.id);
        s.subscribe(c => {
          resultUserRoleResources = c;
          this.resultError.push(resultUserRoleResources.error);

          // push the community if at least one role and take it out of avail
          if ( resultUserRoleResources.result.length>0 ){
            this.communityWithUserRoles.push(new CommWithRoles(comm, resultUserRoleResources.result));
            for (var i =0; i < allCommunities.length; i++){
              if ( allCommunities[i].id === comm.id ){
                allCommunities.splice(i,1);
              }
            }
          }
          this.availCommunities=allCommunities;
        });
      }
      this.reftargetUser = JSON.parse(JSON.stringify(this.targetUser));
    });
  }

  saveTargetUser(): void {
    let result: RestResult;
    this.userService.updateUser(this.targetUser)
      .subscribe(r => {
        result = r;
      });
    this.resetEditMode();
  }

  // set a section to edit mode
  editMode(sectionnumber): void {
    this.resetEditMode();
    this.isdEditMode[sectionnumber] = true;
  }

  cancelEdit(): void {
    // revert changes
    this.targetUser = JSON.parse(JSON.stringify(this.reftargetUser));
    this.resetEditMode();
  }

  resetEditMode(): void {
    for (var i = 0; i < 3; i++) {
      this.isdEditMode[i] = false;
    }
  }

  joinCommunity(): void {

    console.log( this.selectedJoinCommunity );
    console.log( this.selectedOrganization );
    console.log( this.targetUser );
    

    Observable.forkJoin([
      this.roleService.getByNameAndCommunityId(this.selectedJoinCommunity.id,"User"),
      this.roleService.getByNameAndCommunityId(this.selectedJoinCommunity.id,"Organization_Member"),
    ]).subscribe(data => {

      let userRole:Role = data[0].result;
      let orgMemberRole = data[1].result;

      let urrUser:UserRoleResource=new Object();
      let urrOrgMember:UserRoleResource=new Object();

      urrUser.roleId=userRole.id;
      urrUser.userId=this.targetUser.id;
      urrUser.resourceIds=[ this.selectedJoinCommunity.id ];

      urrOrgMember.roleId=orgMemberRole.id;
      urrOrgMember.userId=this.targetUser.id;
      urrOrgMember.resourceIds=[ this.selectedOrganization.id ];

      console.log( urrUser );
      console.log( urrOrgMember );


      Observable.forkJoin([
        this.userRoleResourceService.create(urrUser),
        this.userRoleResourceService.create(urrOrgMember)
      ]).subscribe(dataa => {

        console.log();

        let result0 = dataa[0];
        let result1 = dataa[1];
        
        this.getTargetUser();

      });

    });
  }

  editRoles( commid, roleid, userid ){
    this.router.navigate(['/roles', commid, roleid, userid]);
  }


  getOrganizations(): void {

    this.organizationService.getByCommunityId(this.selectedJoinCommunity.id)
    .subscribe( data => {

      this.organizations= data.result;

    });

  }

}

class CommWithRoles {

  community: Community;
  userRoles: Role[] = [];

  constructor(c: Community, ur: Role[]) {
    this.community = c;
    this.userRoles = ur;
  }
}
