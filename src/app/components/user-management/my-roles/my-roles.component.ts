import { Component, OnInit, ViewChild } from '@angular/core';
import { Observable } from 'rxjs';
import { AngularDualListBoxModule, DualListComponent} from 'angular-dual-listbox';

// Other Components
import { HeaderComponent } from '../../../components/header/header.component';
import { FeedbackComponent } from '../../feedback/feedback.component';

// Generated
import { Community, Program, User, Role, UserRoleResource, AssignRoleRequest } from '../../../generated';
import { MyDetailsService, RoleService, UserRoleResourceService, ProgramsService, AssignRoleRequestService } from '../../../generated';


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

  assignRequests:AssignRoleRequest[]=[];

  submitted: boolean = false;
  isURRModifyable: boolean;
  isNewUserRole: boolean;
  isURRVisible: boolean = false;

  unmodifiableRoles = ["User_Approver", "POM_Manager"];

  // For the angular-dual-listbox
  availablePrograms: Array<Program> = [];
  assignedPrograms: Array<Program> = [];
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
    private programsService: ProgramsService,
    private assignRoleRequestService: AssignRoleRequestService
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
        my.roleService.getByCommunityId(my.currentUser.currentCommunityId),
        my.assignRoleRequestService.getByUser(my.currentUser.id)
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

        // get any existing requests
        my.resultError.push(r[3].error);
        my.assignRequests=r[3].result;
        my.adjustAllRoles();

      });
    });
  }

  private getURR():void {

    var my: MyRolesComponent = this;


    if (null==my.selectedRole.name) return;

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

  private async createRequest() {
    console.log("createRequest");
    var my: MyRolesComponent = this;

    
    let assignedProgs:string[] = [];
    my.assignedPrograms.forEach((x)=>{ assignedProgs.push(x.id) } );

    let request:AssignRoleRequest=new Object();
    request.userId = this.currentUser.id;
    request.communityId = this.currentUser.currentCommunityId;
    request.roleName = this.selectedRole.name;
    request.resourceIds=assignedProgs;

    try {
      await this.assignRoleRequestService.create(request).toPromise();
      this.feedback.success("Your request has been submitted. Your will recieve an email once your request is processed.");
      this.updateRequestedRoles(request);
      this.header.refreshActions();
    } catch(e) {
      this.feedback.failure(e.message);
    }
  }

  private dropRole():void{
    console.log("dropRole"); 
    var my: MyRolesComponent = this;
    let message:string = "Your request has been submitted. Your will recieve an email once your request is processed.";
    my.feedback.success(message); 
  }

  private  updateRequestedRoles(request:AssignRoleRequest){
    var my: MyRolesComponent = this;
    my.assignRequests.push(request);
    my.adjustAllRoles();  
    my.selectedRole=null;  
  }

  private adjustAllRoles(){
    var my: MyRolesComponent = this;
    let pr:string[]=[];
    my.assignRequests.forEach( x => pr.push(x.roleName) );

    let allr:Role[]=[];
    my.allRoles.forEach( r => {
      if ( !pr.includes( r.name ) ){
        allr.push(r);
      }
    });
    my.allRoles = allr;
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
