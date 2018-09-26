import { Component, ViewChild } from '@angular/core';
import { Router, ActivatedRoute, Params } from '@angular/router';
import { Observable } from 'rxjs';

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
export class ManageUsersComponent {

  @ViewChild(HeaderComponent) header;

  // This is the id of the user we are interested in ... the targetUser
  private userid: string;

  // The user we are interested in.
  private targetUser: User;

  // this user's roles and all roles in a community
  private communityWithUserRoles: CommWithRoles[] = [];

  // The name of the role we are assigning the targetUser to
  private addedroleId: string;

  // The name of the community we are assigning the targetUser to
  private selectedJoinCommunity: Community;

  // All the communities the user does not belong to
  private availCommunities: Community[] = [];

  // all organizations of a selected community
  private organizations: Organization[] = [];

  // an organization that was selected
  private selectedOrganization: Organization;

  // an original copy of the targted user so we can roll back.
  private reftargetUser: User;

  // Have we hit the edit button or are we just viewing?
  private isdEditMode: boolean[] = [];

  // Any error from a rest service
  private resultError: string[]=[];

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

  private ngOnInit() {
    this.initTargetUserData();
    this.resetEditMode();
  }

  private initTargetUserData(): void {
    Observable.forkJoin([
      this.userService.getById(this.userid),
      this.communityService.getAll(),
    ]).subscribe(data => {

      this.resultError.push(data[0].error);
      this.targetUser = data[0].result;

      let allCommunities: Community[] = [];

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

  private saveTargetUser(): void {
    let result: RestResult;
    this.userService.updateUser(this.targetUser)
      .subscribe(r => {
        result = r;
      });
    this.resetEditMode();
  }

  // set a section to edit mode
  private editMode(sectionnumber): void {
    this.selectedJoinCommunity=null;
    this.selectedOrganization=null;
    this.resetEditMode();
    this.isdEditMode[sectionnumber] = true;
  }

  private cancelEdit(): void {
    // revert changes
    this.targetUser = JSON.parse(JSON.stringify(this.reftargetUser));
    this.resetEditMode();
  }

  private resetEditMode(): void {
    for (var i = 0; i < 3; i++) {
      this.isdEditMode[i] = false;
    }
  }

  private joinCommunity(): void {
   
    this.userRoleResourceService.joinCommunity(this.targetUser.id, this.selectedOrganization)
      .subscribe( data => {
        this.refresh();
      });
  }

  private leaveCommunity(cwr:CommWithRoles): void {

    let userRole:Role = cwr.userRoles.find( role => role.name == "User" );
    this.userRoleResourceService.getUserRoleByUserAndCommunityAndRoleName(
      this.targetUser.id, userRole.communityId, "User"
    ).subscribe( data => {
      let urr:UserRoleResource = data.result;  
      this.userRoleResourceService.deleteById(urr.id).subscribe( data=> {
      this.refresh();
      });
    });
  }

  private editRoles( commid, roleid, userid ){
    this.router.navigate(['/roles', commid, roleid, userid]);
  }

  private getOrganizations(): void {
    this.organizationService.getByCommunityId(this.selectedJoinCommunity.id)
    .subscribe( data => this.organizations= data.result );
  }

  private refresh(){
    this.communityWithUserRoles=[];
    this.selectedJoinCommunity=null;
    this.selectedOrganization=null;
    this.initTargetUserData();
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
