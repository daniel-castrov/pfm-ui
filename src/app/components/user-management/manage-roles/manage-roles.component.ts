import { Component, OnInit, ViewChild } from '@angular/core';
import { Router, ActivatedRoute, Params } from '@angular/router';
import { Observable } from 'rxjs';
import * as $ from 'jquery';
import { AngularDualListBoxModule } from 'angular-dual-listbox';
import { DualListComponent } from 'angular-dual-listbox';

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
import { Program } from '../../../generated/model/program';
import { ProgramsService } from '../../../generated/api/programs.service';

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

  submitted: boolean = false;
  isURRModifyable: boolean;
  isNewUserRole: boolean;
  isURRVisible: boolean = false;

  unmodifiableRoles = ["User_Approver", "POM_Manager"];

  selectedUserName: string;
  submittedMessage = "no message";


  // For the angular-dual-listbox
  availablePrograms: Array<Program> = [];
  allcount=0;
  assignedPrograms: Array<any> = [];
  key: string = "id";
  display: string = "shortName";
  keepSorted = true;
  filter = false;
  format: any = { add: 'Available Programs', remove: 'Assigned Programs', all: 'Select All', none: 'Select None', direction: DualListComponent.RTL, draggable: true, locale: 'en' };
  disabled = false;
  userAdd = '';
  sourceLeft = true;
  tab = 1;

  constructor(
    private router: Router,
    private communityService: CommunityService,
    private roleService: RoleService,
    private userService: UserService,
    private userRoleResourceService: UserRoleResourceService,
    private programsService: ProgramsService
  ) { }

  public ngOnInit() {
    var my: ManageRolesComponent = this;
    my.getCommunities();
  }

  getCommunities(): void {

    var my: ManageRolesComponent = this;

    let result: RestResult;
    my.communityService.getAll()
      .subscribe(c => {
        result = c;
        my.resultError.push(result.error);
        my.communities = result.result;

        if (null == my.communities || my.communities.length == 0) {
          my.resultError.push("No Communities were found");
          return;
        }
      });
  }

  getRolesAndUsers(): void {

    var my: ManageRolesComponent = this;

    my.clear();
    my.selectedRole = null;
    my.selectedUser = null;

    Observable.forkJoin([
      my.roleService.getByCommunityId(my.selectedCommunity.id),
      my.userService.getByCommId(my.selectedCommunity.id)
    ]).subscribe(data => {
      my.resultError.push(data[0].error);
      my.roles = data[0].result;
      my.resultError.push(data[1].error);
      my.users = data[1].result;
    });
  }

  getURR(): void {

    var my: ManageRolesComponent = this;

    my.clear();
    my.selectedUserName = my.selectedUser.firstName + " " + my.selectedUser.middleInitial + " " + my.selectedUser.lastName;

    Observable.forkJoin([
      my.userRoleResourceService.getUserRoleByUserAndCommunityAndRoleName(my.selectedUser.id, my.selectedCommunity.id, my.selectedRole.name),
      my.programsService.getProgramsByCommunity(my.selectedCommunity.id)
    ]).subscribe(data => {

      my.resultError.push(data[0].error);
      let urr: UserRoleResource = data[0].result;

      my.resultError.push(data[1].error);
      my.availablePrograms = data[1].result;
      my.allcount=my.availablePrograms.length;

      my.isURRVisible = true;
      my.isURRModifyable = true;
      my.isNewUserRole = true;

      if (my.unmodifiableRoles.includes(my.selectedRole.name)) {
        my.isURRModifyable = false;
      }
      if (urr) {
        my.isNewUserRole = false;
        my.selectedURR = urr;
      } else {
        my.selectedURR = new Object();
        my.selectedURR.userId = my.selectedUser.id;
        my.selectedURR.roleId = my.selectedRole.id;
        my.selectedURR.resourceIds = [];
      }

      if (my.selectedURR.resourceIds.includes("x") || my.selectedURR.resourceIds.length==0) {
        // none are granted
        my.assignedPrograms = []; 
      } else if (my.selectedURR.resourceIds.includes("*")) {
        // all are granted - deep copy array
        my.availablePrograms.forEach(function (program) {
          my.assignedPrograms.push(program);
        });
      } else {
        // some are granted
        let newAvail:Program[]=[];
        my.selectedURR.resourceIds.forEach(function ( progId ) {
          my.availablePrograms.forEach(function (prog) {
            if ( prog.id == progId ){
              my.assignedPrograms.push(prog);
            } else {
              newAvail.push(prog);
            }
          });
        });
        my.availablePrograms=newAvail;
      }

    });
  }

  commitUnassign(): void {
    var my: ManageRolesComponent = this;
    my.userRoleResourceService.deleteById(my.selectedURR.id).subscribe(() => {
      my.clear(); 
      my.showCommitMessage(0);
    });
  }

  commit(): void {
    var my: ManageRolesComponent = this;

    if (!my.assignedPrograms || my.assignedPrograms == null || my.assignedPrograms.length==0) {
      // none are selected
      my.selectedURR.resourceIds=["x"];
    } else if (my.assignedPrograms.length==my.allcount) {
      // all are selected
      my.selectedURR.resourceIds=["*"];
    } else {
      // some are selected
      my.selectedURR.resourceIds=[];
      my.assignedPrograms.forEach(function (value) {
        my.selectedURR.resourceIds.push( value.id );
      });
    }

    if (my.isNewUserRole){
      my.userRoleResourceService.create(my.selectedURR).subscribe(() => {
        my.clear(); 
        my.showCommitMessage(1);
      });
    } else {
      my.userRoleResourceService.update(my.selectedURR).subscribe(() => {
        my.clear(); 
        my.showCommitMessage(2);
      });
    }
  }

  showCommitMessage(messageNumber) {
    var my: ManageRolesComponent = this;

    let community_role_name = my.selectedCommunity.abbreviation + " : " + my.selectedRole.name;

    let message: string[] = [
      my.selectedUserName + " no longer has the role of " + community_role_name,
      my.selectedUserName + " has been assigned the role of " + community_role_name,
      my.selectedUserName + "'s resource access for "+community_role_name+" has been modified"
    ];
    my.submitted = true;
    my.submittedMessage = message[messageNumber];
  }


  clear(): void {
    var my: ManageRolesComponent = this;
    my.submitted = false;
    my.isURRVisible = false;
    my.availablePrograms = [];
    my.assignedPrograms = [];
  }

  okNext(): boolean {
    var my: ManageRolesComponent = this;
    if ((!my.selectedRole || my.selectedRole == null || my.selectedRole === "")) {
      return false;
    }
    if ((!my.selectedUser || my.selectedUser == null || my.selectedUser === "")) {
      return false;
    }
    return true;
  }

}
