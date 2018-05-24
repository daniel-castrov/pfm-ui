import { Component, OnInit, ViewChild } from '@angular/core';
import { Router, ActivatedRoute, Params } from '@angular/router';
import { Observable } from 'rxjs';
import * as $ from 'jquery';

// Other Components
import { HeaderComponent } from '../../../components/header/header.component';

// Generated
import { RestResult } from '../../../generated/model/restResult';
import { Community } from '../../../generated/model/community';
import { CommunityService } from '../../../generated/api/community.service';
import { Role } from '../../../generated/model/role'
import { RoleService } from '../../../generated/api/role.service';
import { UserRoleResource } from '../../../generated/model/userRoleResource'
import { UserRoleResourceService } from '../../../generated/api/userRoleResource.service';
import { User } from '../../../generated/model/user';
import { UserService } from '../../../generated/api/user.service';

declare const $: any;
declare const jQuery: any;

@Component({
  selector: 'app-manage-roles',
  templateUrl: './manage-roles.component.html',
  styleUrls: ['./manage-roles.component.scss']
})

export class ManageRolesComponent {

  @ViewChild(HeaderComponent) header;

  resultError: string[] = [];

  communities: Community[] = [];
  roles: Role[] = [];
  users: User[] = [];

  selectedCommunity: Community;  
  selectedRole: Role;
  selectedUser: User;
  selectedURR: UserRoleResource;

  commRoleUserOK: boolean=false;
  isModifyable: boolean;
  newUserRole:boolean;

  buttonText:string;

  unmodifiableRoles = ["User_Approver","POM_Manager"];

  constructor(
    private router: Router,
    private communityService: CommunityService,
    private roleService: RoleService,
    private userService: UserService,
    private userRoleResourceService: UserRoleResourceService
  ) {
  }

  public ngOnInit() {
    jQuery(document).ready(function ($) {
      $('#multiselect1').multiselect();
      // $('#multiselect2').multiselect();
    });
    this.getCommunities();
  }
 
  getCommunities(): void {
    let result: RestResult;
    this.communityService.getAll()
      .subscribe(c => {
        result = c;
        this.resultError.push(result.error);
        this.communities = result.result;

        if (null == this.communities || this.communities.length == 0) {
          this.resultError.push("No Communities were found");
          return;
        }
      });
  }

  getRolesAndUsers(): void {
      console.log("get Roles and Users for Community " + this.selectedCommunity.id);
      Observable.forkJoin([
        this.roleService.getByCommunityId(this.selectedCommunity.id),
        this.userService.getByCommId (this.selectedCommunity.id),
      ]).subscribe(data => {

        this.resultError.push(data[0].error);
        this.resultError.push(data[1].error);

        this.roles = data[0].result;
        this.users = data[1].result;

    });
  }
  
  getURR(): void {

    this.commRoleUserOK=true;

    console.log(this.selectedCommunity.name);
    console.log(this.selectedRole.name);
    console.log(this.selectedUser.firstName);

    this.userRoleResourceService.getUserRoleByUserAndCommunityAndRoleName(this.selectedUser.id, this.selectedCommunity.id,  this.selectedRole.name)
    .subscribe( (response: RestResult) => {

      this.resultError.push(response.error);
      let urr:UserRoleResource = response.result;

      this.isModifyable = true;
      this.newUserRole = true;
      if ( urr ){
        this.newUserRole=false;
      } 
      if ( this.unmodifiableRoles.indexOf(this.selectedRole.name) > -1  ){
        this.isModifyable=false;        
      }

    });

  }

  commit(): void {
  }

  clear(): void {
    this.commRoleUserOK=false;
  }

}
