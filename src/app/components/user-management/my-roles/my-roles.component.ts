import { Component, OnInit, ViewChild } from '@angular/core';
import { Observable } from 'rxjs';
import { AngularDualListBoxModule, DualListComponent} from 'angular-dual-listbox';

// Other Components
import { HeaderComponent } from '../../../components/header/header.component';
import { FeedbackComponent } from '../../feedback/feedback.component';

// Generated
import { Community, Program, User, Role, UserRoleResource } from '../../../generated';
import { MyDetailsService, RoleService, UserRoleResourceService, ProgramsService } from '../../../generated';


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
  selectedURR:UserRoleResource;

  submitted: boolean = false;
  isURRModifyable: boolean;
  isNewUserRole: boolean;
  isURRVisible: boolean = false;

  unmodifiableRoles = ["User_Approver", "POM_Manager"];

  // For the angular-dual-listbox
  availablePrograms: Array<Program> = [];
  assignedPrograms: Array<any> = [];
  key: string = "id";
  display: string = "shortName";
  keepSorted = true;
  filter = false;
  format: any = { add: 'Available Programs', remove: 'Assigned Programs', all: 'Select All', none: 'Select None', direction: DualListComponent.RTL, draggable: true, locale: 'en' };
  disabled = false;
  //userAdd = '';
  //sourceLeft = true;
  //tab = 1;
  allcount=0;


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

    var my: MyRolesComponent = this;

    Observable.forkJoin([
      my.userRoleResourceService.getUserRoleByUserAndCommunityAndRoleName(my.currentUser.id, my.currentUser.currentCommunityId, my.selectedRole.name),
      my.programsService.getProgramsByCommunity(my.currentUser.currentCommunityId)
    ]).subscribe(data => {

      my.resultError.push(data[0].error);
      let urr: UserRoleResource = data[0].result;

      my.resultError.push(data[1].error);
      my.availablePrograms = data[1].result;
      my.allcount=my.availablePrograms.length;

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
        my.selectedURR.userId = my.currentUser.id;
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
