import { Component, OnInit, ViewChild } from '@angular/core';
import { UserComponent } from '../user/user.component';
import { User } from '../../generated/model/user';
import { RestResult } from '../../generated/model/restResult';
import { Communication } from '../../generated/model/communication';
import { HeaderComponent } from '../../components/header/header.component';
import { CommunityService, Community, UserService } from '../../generated';
import { Role, RoleService, UserRole } from '../../generated';
import { Response, ResponseContentType } from '@angular/http';
import {
  HttpClient, HttpHeaders, HttpParams,
  HttpResponse, HttpEvent
} from '@angular/common/http';
import { Observable } from 'rxjs/Observable';
import { Router, ActivatedRoute, Params } from '@angular/router';

@Component({
  selector: 'app-manage-users',
  templateUrl: './manage-users.component.html',
  styleUrls: ['./manage-users.component.css']
})
export class ManageUsersComponent implements OnInit {

  @ViewChild(HeaderComponent) header;

  // This is the id of the user we are interested in ... the targetUser
  id: string;

  // The user we are interested in.
  targetUser:User;

  // all the roles available ( all minus the ones we have )
  allRoles:Role[]=[];

  // The roles that this user has
  userRoles:UserRole[]=[];
  
  // The name of the role we are assigning the targetUser to
  addedrole:string;

  // an original copy of the targted user so we can roll back.
  reftargetUser:User;

  // Have we hit the edit button or are we just viewing?
  isdEditMode=false;

  // Any error from a rest service
  resultError: string;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private userService: UserService,
    private roleService: RoleService,

  ) {
    this.route.params.subscribe((params: Params) => {
      this.id = params.id;
    });
  }

  ngOnInit() {
    this.getTargetUser();
    this.getAllRoles();
    this.getTargetedUserRoles();
  }

  getTargetUser(): void{
    let result:RestResult;
    this.userService.get(this.id)
    .subscribe(c => {
      result = c;
      this.resultError = result.error;
      this.targetUser=result.result;
      console.log(this.targetUser.firstName);
       // Make a copy of the current user so we can revert changes
       this.reftargetUser = JSON.parse(JSON.stringify(this.targetUser));
    });
  }

  saveTargetUser():void{
    // clean up empty communications
    for(var i = this.targetUser.communications.length - 1; i >= 0; i--) {
      if(this.targetUser.communications[i].value === "") {
        this.targetUser.communications.splice(i, 1);
      }
    }
    let result:RestResult;
    this.userService.create(this.targetUser)
    .subscribe(r => {
      result=r;
    });
    this.isdEditMode=false;
  }

  // toggle edit mode
  editMode():void{
    this.isdEditMode=true;
    this.buildAvailableRoles();
  }

  cancelEdit():void{
    // revert changes
    this.targetUser = JSON.parse(JSON.stringify(this.reftargetUser));
    this.isdEditMode=false;
  }

  createNewCommunication():void{
    let newCom:Communication;
    newCom = new Object;
    newCom.type = "EMAIL";
    newCom.confirmed = false;
    newCom.preferred = false;
    newCom.subtype = "SECONDARY";
    newCom.value = "";
    this.targetUser.communications.push(newCom);
  }


  getAllRoles(): void{
    
    let result1:RestResult;
    this.roleService.findall()
    .subscribe(c => {
      result1 = c;
      this.resultError = result1.error;
      this.allRoles=result1.result;
      let role:Role;
    });
  }

  getTargetedUserRoles(): void{

    let result2:RestResult;
    this.roleService.find(this.id)
    .subscribe(c => {
      result2 = c;
      this.resultError = result2.error;
      this.userRoles=result2.result;
//      let role:Role;
//      console.log("My Roles");
//      for ( role of this.userRoles ){
//        console.log(role.roleName);
//      }
      
    });
  }

buildAvailableRoles():void{
  console.log("MATCH");
  let userRole:UserRole;
  for ( userRole of this.userRoles ){
    let role:Role;
    for ( role of this.allRoles ){
      if ( userRole.roleName === role.roleName ){
        var index = this.allRoles.indexOf(role);
        if ( index > -1 ){
          this.allRoles.splice(index, 1);
        }
      }
    }
  }

}

  addRole(): void{
    console.log("addRole"+this.addedrole);

    let newUsreRole:UserRole;
    newUsreRole = new Object();

    newUsreRole.email=this.targetUser.email;
    newUsreRole.roleName=this.addedrole;

    let reuslt3:RestResult; 
    
    this.roleService.assignUserToRole(newUsreRole)
    .subscribe(c => {
      reuslt3 = c;
      this.resultError = reuslt3.error;
      this.userRoles.push(newUsreRole);
      this.resetAddRole();
      this.buildAvailableRoles();
    });
  }
  
  resetAddRole():void{
    this.addedrole='';
  }


}
