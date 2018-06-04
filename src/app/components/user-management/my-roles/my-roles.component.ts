import { Component, OnInit, ViewChild } from '@angular/core';
import { Observable } from 'rxjs';
import { AngularDualListBoxModule, DualListComponent} from 'angular-dual-listbox';

// Other Components
import { HeaderComponent } from '../../../components/header/header.component';
import { FeedbackComponent } from '../../feedback/feedback.component';

// Generated
import { Community, Program, User, Role, UserRoleResource, AssignRoleRequest, DropRoleRequest } from '../../../generated';
import { MyDetailsService, RoleService, UserRoleResourceService, ProgramsService, AssignRoleRequestService, DropRoleRequestService } from '../../../generated';


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

  allRoles:Role[] = [];
  currentRoles:Role[] = [];
  assignRequests:AssignRoleRequest[]=[];
  assignableRoles:Role[] = [];
  dropRequests:DropRoleRequest[]=[];
  dropableRoles:Role[] = [];

  currentRolesWithResources:RoleNameWithResources[] = [];
  allcount=0;
  unmodifiableRoles = ["User_Approver", "POM_Manager"];
  pogramsMap:any[]=[];
  
  selectedAddRole:Role;
  selectedDropRole:Role;
  selectedURR:UserRoleResource;

  isURRModifyable: boolean;
  isNewUserRole: boolean;
  isURRVisible: boolean = false;

  // For the angular-dual-listbox
  availablePrograms: Array<Program> = [];
  assignedPrograms: Array<Program> = [];
  key: string = "id";
  display: string = "shortName";
  keepSorted = true;
  filter = false;
  format: any = { add: 'Available Programs', remove: 'Assigned Programs', all: 'Select All', none: 'Select None', direction: DualListComponent.RTL, draggable: true, locale: 'en' };
  disabled = false;

  constructor(
    private myDetailsService:MyDetailsService,  
    private roleService: RoleService,
    private userRoleResourceService: UserRoleResourceService,
    private programsService: ProgramsService,
    private assignRoleRequestService: AssignRoleRequestService,
    private dropRoleRequestService:DropRoleRequestService
  ) { }

  ngOnInit() {
    this.getUserAndRoles();
  }

  private onChangeAddRoleSelector():void {
    var my: MyRolesComponent = this;
    my.selectedDropRole = null;
    my.isURRModifyable = false;
    if ( my.selectedAddRole ) my.getURR();
  }

  private onChangeDropRoleSelector():void{
    var my: MyRolesComponent = this;
    my.selectedAddRole = null;
    my.isURRModifyable = false;
  }

  private async createAssignRequest() {
    var my: MyRolesComponent = this;

    // Get all the progIds from the selected 'assignedPrograms'
    let assignedProgs:string[];

    console.log (my.assignedPrograms.length+" : "+my.allcount);

    if (!my.assignedPrograms || my.assignedPrograms == null || my.assignedPrograms.length==0) {
      // none are selected
      assignedProgs=["x"];
    } else if (my.assignedPrograms.length==my.allcount) {
      // all are selected
      assignedProgs=["*"];
    } else {
      // some are selected
      assignedProgs=[];
      my.assignedPrograms.forEach(function (value) {
        assignedProgs.push( value.id );
      });
    }

    // build the new request
    let request:AssignRoleRequest=new Object();
    request.userId = my.currentUser.id;
    request.communityId = my.currentUser.currentCommunityId;
    request.roleName = my.selectedAddRole.name;
    request.isNew=my.isNewUserRole;
    request.resourceIds=assignedProgs;

    // Submit it
    try {
      await my.assignRoleRequestService.create(request).toPromise();
      my.feedback.success("Your request has been submitted. Your will recieve an email once your request is processed.");
      my.updateAssignRequests(request);
      my.header.refreshActions();
      my.selectedAddRole = null;
      my.isURRModifyable = false;
    } catch(e) {
      my.feedback.failure(e.message);
    }
  }

  private async createDropRequest(){
    var my: MyRolesComponent = this;

    // build the new request
    let request:DropRoleRequest= new Object();
    request.userId = my.currentUser.id;
    request.communityId = my.currentUser.currentCommunityId;
    request.roleName = my.selectedDropRole.name;

    // Submit it
    try {
      await my.dropRoleRequestService.create(request).toPromise();
      my.feedback.success("Your request has been submitted. Your will recieve an email once your request is processed.");
      my.updateDropRequests(request);
      my.header.refreshActions();
      my.selectedDropRole = null;
      my.isURRModifyable = false;
    } catch(e) {
      my.feedback.failure(e.message);
    }
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
        my.assignRoleRequestService.getByUser(my.currentUser.id),
        my.dropRoleRequestService.getByUser(my.currentUser.id)
      ]).subscribe(r => {

        // Get all the programs and put them in a map
        my.resultError.push(r[0].error);
        my.availablePrograms = r[0].result;
        my.allcount=my.availablePrograms.length;
        my.availablePrograms.forEach ( p => my.pogramsMap[p.id] = p );

        // Get the current user's roles and match them with the program names
        my.resultError.push(r[1].error);
        my.currentRoles =r[1].result;
        my.currentRoles.forEach( role => {
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

        // Get all the roles
        my.resultError.push(r[2].error);
        my.allRoles=r[2].result;

        // get any existing add requests
        my.resultError.push(r[3].error);
        my.assignRequests=r[3].result;

        // get any existing drop requests
        my.resultError.push(r[4].error);
        my.dropRequests=r[4].result;

        my.buildSelectables();

      });
    });
  }

  private getURR():void {
    var my: MyRolesComponent = this;

    Observable.forkJoin([
      my.userRoleResourceService.getUserRoleByUserAndCommunityAndRoleName(my.currentUser.id, my.currentUser.currentCommunityId, my.selectedAddRole.name)
    ]).subscribe(data => {

      my.resultError.push(data[0].error);
      let urr: UserRoleResource = data[0].result;

      my.isURRModifyable = true;
      my.isNewUserRole = true;

      if (my.unmodifiableRoles.includes(my.selectedAddRole.name)) {
        my.isURRModifyable = false;
      }
      if (urr) {
        my.isNewUserRole = false;
        my.selectedURR = urr;
      } else {
        my.selectedURR = new Object();
        my.selectedURR.userId = my.currentUser.id;
        my.selectedURR.roleId = my.selectedAddRole.id;
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

  private  updateAssignRequests(request:AssignRoleRequest){
    var my: MyRolesComponent = this;
    my.assignRequests.push(request);
    my.buildSelectables();  
    my.selectedAddRole=null;  
  }

  private updateDropRequests(request:DropRoleRequest){
    var my: MyRolesComponent = this;
    my.dropRequests.push(request);
    my.buildSelectables();  
    my.selectedDropRole=null;  
  }
  
  private buildSelectables(){
    var my: MyRolesComponent = this;

    // calculate the dropable menu
    my.dropableRoles=[ ...my.currentRoles ];
    let pr:string[]=[];
    my.assignRequests.forEach( x => pr.push(x.roleName) );
    my.dropRequests.forEach( x => pr.push(x.roleName) );

    let  dRoles:Role[]=[];
    my.dropableRoles.forEach( r => {
      if ( !pr.includes(r.name) ){ 
        dRoles.push(r); 
      } 
    });
    my.dropableRoles = dRoles;

    // calculate the assignable menu
    my.assignableRoles=[ ...my.allRoles ];
    my.currentRoles.forEach( x => {
      if( my.unmodifiableRoles.includes(x.name) ){
        pr.push(x.name);
      }
    });
    let aRoles:Role[]=[];
    my.assignableRoles.forEach( r => {
      if ( !pr.includes( r.name ) ){
        aRoles.push(r);
      }
    });
    my.assignableRoles = aRoles;
  }
}

// a class for viewing the current roles with the associated resources (program names)
class RoleNameWithResources {
  role: Role;
  resources: string[];
  constructor(ro: Role, re: string[]) {
    this.role = ro;
    this.resources = re;
  }
}
