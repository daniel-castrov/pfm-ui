import { Component, OnInit, ViewChild } from '@angular/core';
import { Observable } from 'rxjs';

// Other Components
import { HeaderComponent } from '../../../components/header/header.component';
import { FeedbackComponent } from '../../feedback/feedback.component';

// Generated
import { Community } from '../../../generated';
import { User } from '../../../generated';
import { MyDetailsService } from '../../../generated/api/myDetails.service';
import { Role } from '../../../generated/model/role';
import { RoleService } from '../../../generated/api/role.service';
import { UserRoleResource } from '../../../generated/model/userRoleResource'
import { UserRoleResourceService } from '../../../generated/api/userRoleResource.service';
import { Program } from '../../../generated/model/program';
import { ProgramsService } from '../../../generated/api/programs.service';


@Component({
  selector: 'app-my-roles',
  templateUrl: './my-roles.component.html',
  styleUrls: ['./my-roles.component.scss']
})
export class MyRolesComponent implements OnInit {

  @ViewChild(HeaderComponent) header;
  @ViewChild(FeedbackComponent) feedback: FeedbackComponent;

  resultError: string[] = [];
  currentUser:User;
  dropableRoles:Role[] = [];
  allRoles:Role[] = [];
  selectedRole:Role;
  pogramsMap:any[]=[];

  currentRolesWithResources:RoleNameWithResources[] = [];


  constructor(
    private myDetailsService:MyDetailsService,  
    private roleService: RoleService,
    private userRoleResourceService: UserRoleResourceService,
    private programsService: ProgramsService
  ) { }


  ngOnInit() {
    this.getUserAndRoles();
  }

  private getUserAndRoles():void {
    var my: MyRolesComponent = this;

    // get the current user
    my.myDetailsService.getCurrentUser().subscribe((u) => {
      my.resultError.push(u.error);
      my.currentUser=u.result;

      Observable.forkJoin([
        my.programsService.getProgramsByCommunity(my.currentUser.currentCommunityId),
        my.roleService.getByUserIdAndCommunityId(my.currentUser.id, my.currentUser.currentCommunityId),
        my.roleService.getByCommunityId(my.currentUser.currentCommunityId)
      ]).subscribe(r => {

        // Get all the programs and put thenm in a map
        my.resultError.push(r[0].error);
        let programs:Program[]=r[0].result;
        programs.forEach ( p => my.pogramsMap[p.id] = p );

        // Get the current user's roles and match them with the program names
        my.resultError.push(r[1].error);
        let currentRoles:Role[] =r[1].result;
        currentRoles.forEach( role => {
          my.userRoleResourceService.getUserRoleByUserAndCommunityAndRoleName(
            my.currentUser.id, my.currentUser.currentCommunityId,role.name
          ).subscribe( ( ur ) => { 
            let urr:UserRoleResource;
            urr=ur.result;
            let progNames:string[]=[];
            urr.resourceIds.forEach( r => {
              try {
                progNames.push(my.pogramsMap[r].shortName );
              } catch (any){
                progNames.push(r);
              }
            });
            my.currentRolesWithResources.push( new RoleNameWithResources ( role, progNames ) );
          });
        });
        my.dropableRoles=currentRoles;

        // Get all the roles
        my.resultError.push(r[2].error);
        my.allRoles=r[2].result;

      });
    });
  }

  private getURR():void {
    console.log("getURR");
  }

  private nothing():void{
    console.log("nothing");
  }

  private createRequest(): void{
    console.log("createRequest");
    var my: MyRolesComponent = this;
    let message:string = "Your request has been submitted. Your will recieve an email once your request is processed.";
    my.feedback.success(message);
  }

  private dropRole():void{
    console.log("dropRole"); 
    var my: MyRolesComponent = this;
    let message:string = "Your request has been submitted. Your will recieve an email once your request is processed.";
    my.feedback.success(message); 
  }

}

class RoleNameWithResources {
  role: Role;
  resources: string[];
  constructor(ro: Role, re: string[]) {
    this.role = ro;
    this.resources = re;
  }
}
