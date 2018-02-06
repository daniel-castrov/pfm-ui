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

  id: string;
  jsonUser: string;

  targetUser:User;

  targetUserRoles:Role[]=[];
  allRoles:Role[]=[];
  userRoles:UserRole[]=[];

  reftargetUser:User;
  isdEditMode=false;

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
    this.getRoles();
  }


  getTargetUser(): void{
    let result:RestResult;
    this.userService.get(this.id)
    .subscribe(c => {
      result = c;
      this.resultError = result.error;
      this.targetUser=result.result;
      
      console.log(this.targetUser);
      
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

    // FIX ME
    this.targetUser.authorities=[];
    console.log(JSON.stringify(this.targetUser));

    let result:RestResult;
    //this.userService.create(this.targetUser)
    //.subscribe(r => {
    //  result=r;
    //});

    this.isdEditMode=false;
  }

  // toggle edit mode
  editMode():void{
    this.isdEditMode=true;
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


  getRoles(): void{
    
    let result:RestResult;
    this.roleService.findall()
    .subscribe(c => {
      result = c;
      this.resultError = result.error;
      this.allRoles=result.result;
      let role:Role;
    console.log("All Roles");
    for ( role of this.allRoles ){
      console.log(role.roleName);
    }
    });
    
    this.roleService.find(this.id)
    .subscribe(c => {
      result = c;
      this.resultError = result.error;
      this.userRoles=result.result;

      let rolee:Role;
      console.log("My Roles");
      for ( rolee of this.userRoles ){
        console.log(rolee.roleName);
      }
  
    });



  }



}
