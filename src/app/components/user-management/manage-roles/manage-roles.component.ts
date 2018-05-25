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
  selectedUserName:string;
  selectedURR: UserRoleResource;

  commRoleUserOK: boolean=false;
  submitted:boolean=false;
  submittedMessage="no message";
  isModifyable: boolean;
  newUserRole:boolean;

  unmodifiableRoles = ["User_Approver","POM_Manager"];

  // For the dual select 
  availablePrograms:Program[] = [];
  assignedPrograms:Program[] = [];
  key:string = "id";
	display:string = "shortName";
	keepSorted = true;
	filter = false;
  format:any = { add: 'Available Programs', remove: 'Assigned Programs', all: 'Select All', none: 'Select None', direction: DualListComponent.RTL, draggable: true, locale: 'en' };
  disabled = false;
  userAdd = '';
	sourceLeft = false;
  tab = 1;

  constructor(
    private router: Router,
    private communityService: CommunityService,
    private roleService: RoleService,
    private userService: UserService,
    private userRoleResourceService: UserRoleResourceService, 
    private programsService: ProgramsService
  ) {

  }

  public ngOnInit() {
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
        this.programsService.getProgramsByCommunity(this.selectedCommunity.id)
      ]).subscribe(data => {

        this.resultError.push(data[0].error);
        this.resultError.push(data[1].error);
        this.resultError.push(data[2].error);
        
        this.roles = data[0].result;
        this.users = data[1].result;
        this.availablePrograms = data[2].result;
    });
  }
  
  getURR(): void {

    this.commRoleUserOK=true;

    console.log("Community: " + this.selectedCommunity.name);
    console.log("Role: " + this.selectedRole.name);
    console.log("User: " + this.selectedUser.firstName);

    this.selectedUserName = this.selectedUser.firstName +  " " + this.selectedUser.middleInitial +  " " + this.selectedUser.lastName;

    this.userRoleResourceService.getUserRoleByUserAndCommunityAndRoleName(this.selectedUser.id, this.selectedCommunity.id,  this.selectedRole.name)
    .subscribe( (response: RestResult) => {

      this.resultError.push(response.error);
      let urr:UserRoleResource = response.result;

      this.isModifyable = true;
      this.newUserRole = true;

      let initialResourceIds = ["x"];
      if ( this.unmodifiableRoles.includes(this.selectedRole.name)){
        this.isModifyable=false;
        initialResourceIds=["*"];
      }
      if ( urr ){
        this.newUserRole=false;
        this.selectedURR = urr;
      } else {
        this.selectedURR = new Object();
        this.selectedURR.userId=this.selectedUser.id;
        this.selectedURR.roleId=this.selectedRole.id;
        this.selectedURR.resourceIds = initialResourceIds;
      }


      if ( this.selectedURR.resourceIds.includes("*") ){

        //Deep copy array
        //this.assignedPrograms=[];
        this.availablePrograms.forEach( function (value) { 
          //this.assignedPrograms.push(value);
          console.log(value.shortName);
          
        } );

        //this.assignedPrograms=jQuery.extend(true, {}, this.availablePrograms);
        //this.availablePrograms= [];
      }
 

    });
  }

  commitModify(): void {
    
    if (this.newUserRole){
      this.commitAssign();
    } else {
      this.commit();
      this.submitted = true;
      this.submittedMessage = this.getCommitMessage(0);
    }
  }

  commitAssign():void{
    this.commit();
    this.submitted = true;
    this.submittedMessage = this.getCommitMessage(2);

  }

  commitUnassign():void{
    this.commit();
    this.submitted = true;
    this.submittedMessage = this.getCommitMessage(1);
  }

  commit(): void {
    console.log( this.selectedURR );
    this.selectedURR.resourceIds.forEach( function (value) { console.log(value) } );

    this.assignedPrograms.forEach( function (value) {
      console.log(value.shortName);
    });

    this.clear();
  }

  getCommitMessage( messageNumber ):string{
    
    let role_community_name = this.selectedRole.name + " - " + this.selectedCommunity.abbreviation;

    let message:string[]=[
      this.selectedUserName+"'s Resources have been modified",
      this.selectedUserName+" no longer has the role of "+role_community_name,
      this.selectedUserName + " has been assigned the role of " + role_community_name
    ];

    return message[messageNumber];
  }


  clear(): void {
    this.commRoleUserOK=false;
    this.submitted = false;
  }

}
