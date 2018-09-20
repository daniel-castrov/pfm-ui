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
  selectedAddCommunity: Community;

  // All the communities the user does not belong to
  avail_Communities: Community[] = [];

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
          this.avail_Communities=allCommunities;
        });
      }
      this.reftargetUser = JSON.parse(JSON.stringify(this.targetUser));

    });
  }


  getTargetUser2(): void {
    this.communityWithUserRoles=[];
    // 1. get the user
    let resultUser: RestResult;
    this.userService.getById(this.userid)
      .subscribe(c => {
        resultUser = c;
        this.resultError.push(resultUser.error);
        this.targetUser = resultUser.result;
        console.log("TargetUser: " + this.targetUser.cn);

        // 2. get all communities
        let allCommunities: Community[] = [];
        let resultComm: RestResult;

        let s = this.communityService.getAll();
        s.subscribe(c => {
          resultComm = c;
          this.resultError.push(resultComm.error);
          allCommunities = resultComm.result;

          // 3. Get this user's roles in each community
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
              this.avail_Communities=allCommunities;
            });
          }
          // end 3
        });
        // end 2
        // Make a copy of the current user so we can revert changes
        this.reftargetUser = JSON.parse(JSON.stringify(this.targetUser));
      });
      // end 1
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

  addCommunity(): void {


    console.log( this.selectedAddCommunity );
    console.log( this.selectedOrganization );
    console.log( this.targetUser );
    

    // let resultRole: RestResult;
    // this.roleService.getByNameAndCommunityId(this.selectedAddCommunity,"User")
    // .subscribe(r => {
    //   resultRole = r;
    //   this.resultError.push(resultRole.error);

    //   let userRole:Role;
    //   userRole = resultRole.result;
    //   let userRoleRes:UserRoleResource=new Object();
    //   userRoleRes.roleId=userRole.id;
    //   userRoleRes.userId=this.userid;

    //   let resultUserRoleResource: RestResult;
    //   this.userRoleResourceService.create(userRoleRes)
    //   .subscribe(r => {
    //     resultUserRoleResource = r;
    //     this.getTargetUser();
    //   });
    // });
  }

  editRoles( commid, roleid, userid ){
    this.router.navigate(['/roles', commid, roleid, userid]);
  }


  getOrgs(): void {

    this.organizationService.getByCommunityId(this.selectedAddCommunity)
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
