import { Component, OnInit, ViewChild } from '@angular/core';
import { Router, ActivatedRoute, Params } from '@angular/router';
import { Observable } from 'rxjs';
import { AngularDualListBoxModule } from 'angular-dual-listbox';
import { DualListComponent } from 'angular-dual-listbox';

// Other Components
import { HeaderComponent } from '../../header/header.component';
import { WithFullNameService, ProgramWithFullName } from '../../../services/with-full-name.service';
import { NotifyUtil } from '../../../utils/NotifyUtil';

// Generated
import { Community, Role, UserRoleResource, User, Organization }  from '../../../generated';
import { CommunityService, RoleService, UserRoleResourceService, OrganizationService,} from '../../../generated';

import { 
  AssignRoleRequest, 
  DropRoleRequest,
  MyDetailsService, 
  AssignRoleRequestService, 
  DropRoleRequestService } from '../../../generated';

@Component({
  selector: 'app-my-roles',
  templateUrl: './my-roles.component.html',
  styleUrls: ['./my-roles.component.scss']
})

export class MyRolesComponent {

  @ViewChild(HeaderComponent) header;

  private resultError: string[] = [];

  private roles: Role[] = [];

  private currentRoles: Role[] = [];
  private assignRequests:AssignRoleRequest[]=[];
  private dropRequests:DropRoleRequest[]=[];

  private currentRolesWithResources:RoleNameWithResources[] = [];

  private myCommunity: Community;
  private myOrganization: Organization;

  private selectedOrganization: Organization;
  private organizations: Organization[] = [];

  private selectedRole: Role;
  
  private currentUser: User;
  private selectedURR: UserRoleResource;

  private submitted: boolean = false;

  private isNewUserRole: boolean;
  private isVisible: boolean;
  private requestExists: boolean;

  private cannotChangeResources:string [] = ["User_Approver", "POM_Manager","Funds_Requestor", "Program_Manager" ];
  private canChangeResources: boolean;

  private orgBasedRoles: string [] = ["Funds_Requestor", "Program_Manager" ];
  private isOrgBased: boolean;

  private hiddenRoles: string [] = ["Organization_Member", "User" ];
  
  // For the angular-dual-listbox
  private availablePrograms: Array<ProgramWithFullName> = [];
  private filteredAvailablePrograms: Array<ProgramWithFullName> = [];
  private assignedPrograms: Array<any> = [];
  private key: string = "id";
  private display: string = "fullname";
  private keepSorted = true;
  private filter = false;
  private format: any = { add: 'Available Programs', remove: 'Assigned Programs', all: 'Select All', none: 'Select None', direction: DualListComponent.RTL, draggable: true, locale: 'en' };
  private disabled = false;
  private allcount=0;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private communityService: CommunityService,
    private roleService: RoleService,
    private userRoleResourceService: UserRoleResourceService,
    private orgService: OrganizationService,
    private withFullNameService: WithFullNameService,
    private myDetailsService:MyDetailsService,  
    private assignRoleRequestService: AssignRoleRequestService,
    private dropRoleRequestService:DropRoleRequestService,
  ) { 
  }

  public ngOnInit() {
    this.getUserAndRoles();
  }

  private getUserAndRoles():void {

    // get the current user
    this.myDetailsService.getCurrentUser().subscribe((u) => {
      this.resultError.push(u.error);
      this.currentUser=u.result;

      Observable.forkJoin([
        this.communityService.getById( this.currentUser.currentCommunityId ),
        this.orgService.getById(this.currentUser.organizationId),
        this.withFullNameService.programsByCommunity(this.currentUser.currentCommunityId),
        this.roleService.getByUserIdAndCommunityId(this.currentUser.id, this.currentUser.currentCommunityId),
        this.roleService.getByCommunityId(this.currentUser.currentCommunityId),
        this.assignRoleRequestService.getByUser(this.currentUser.id),
        this.dropRoleRequestService.getByUser(this.currentUser.id),
        this.orgService.getByCommunityId(this.currentUser.currentCommunityId)

      ]).subscribe(data => {
        
        this.resultError.push(data[0].error);
        this.myCommunity = data[0].result;

        this.resultError.push(data[1].error);
        this.myOrganization=data[1].result;

        let pogramsMap:any[]=[];
        // Put the users org in the map
        pogramsMap[this.currentUser.organizationId] = this.myOrganization.abbreviation + " (Org)";
        // Get the current user's roles and match them with the program names
        let programs:ProgramWithFullName[] = data[2];
        programs.forEach( prog => {
          pogramsMap[prog.id] = prog.fullname;
        });

        this.resultError.push(data[3].error);
        this.currentRoles =data[3].result;
        this.currentRoles = this.currentRoles.filter( role => !this.hiddenRoles.includes( role.name ) );

        this.currentRoles.forEach( role => {
          this.userRoleResourceService.getUserRoleByUserAndCommunityAndRoleName(
            this.currentUser.id, this.currentUser.currentCommunityId, role.name
          ).subscribe( ( ur ) => { 
            let urr:UserRoleResource;
            urr=ur.result;
            let progNames:string[]=[];
            urr.resourceIds.forEach( r => {
              
              if ( pogramsMap[r] ) {
                progNames.push(pogramsMap[r]);
              } else {
                if ( r=="x" ) {r="none";}
                else { r="*"; }
                progNames.push(r);
              }
            });
            this.currentRolesWithResources.push( new RoleNameWithResources ( role, progNames ) );
          });
        });

        // Get all the roles
        this.resultError.push(data[4].error);
        this.roles=data[4].result;  
        this.roles = this.roles.filter( role => !this.hiddenRoles.includes( role.name ) );

        // get any existing add requests
        this.resultError.push(data[5].error);
        this.assignRequests=data[5].result;

        // get any existing drop requests
        this.resultError.push(data[6].error);
        this.dropRequests=data[6].result;

        this.resultError.push(data[7].error);
        this.organizations=data[7].result;

      });
    });
  }


  private checkRequestsForExisting(){

    if ( this.dropRequests.find( req => req.roleName == this.selectedRole.name ) 
    || this.assignRequests.find( req => req.roleName == this.selectedRole.name )
    ) {
      this.requestExists = true;
      this.isVisible = false;
    } else {
      this.requestExists = false;
      this.getURR();
    }
  }

  private getURR(): void {

    this.clear();

    this.canChangeResources = false;
    if ( !this.cannotChangeResources.includes( this.selectedRole.name ) ) {
      this.canChangeResources = true;
    } 

    this.isOrgBased = false;
    if ( this.orgBasedRoles.includes( this.selectedRole.name ) ){
      this.isOrgBased = true;
    }

    this.isVisible = true;
    this.isNewUserRole = true;

    Observable.forkJoin([
      this.userRoleResourceService.getUserRoleByUserAndCommunityAndRoleName(this.currentUser.id, this.myCommunity.id, this.selectedRole.name),
      this.withFullNameService.programsByCommunity(this.myCommunity.id),
    ]).subscribe(data => {

      this.resultError.push(data[0].error);
      let urr: UserRoleResource = data[0].result;

      this.resultError.push(data[1].error);
      this.availablePrograms = data[1];
      
      if (urr) {
        this.isNewUserRole = false;
        this.selectedURR = urr;
        if (this.selectedURR.resourceIds.includes("x") || this.selectedURR.resourceIds.length==0) {
          // none are granted
          this.assignedPrograms = []; 
        } else if (this.selectedURR.resourceIds.includes("*")) {
          // all are granted - shallow copy array
          this.assignedPrograms = [ ...this.availablePrograms ];
        } else {
          // some are granted
          let newAvail:ProgramWithFullName[]=[];
          this.selectedURR.resourceIds.forEach( progId =>  {
            this.availablePrograms.forEach( prog => {
              if ( prog.id == progId ){
                this.assignedPrograms.push(prog);
              } else {
                newAvail.push(prog);
              }
            });
          });
          this.availablePrograms=newAvail;
        }
      } else {
        this.selectedURR = new Object();
        this.selectedURR.userId = this.currentUser.id;
        this.selectedURR.roleId = this.selectedRole.id;
        this.selectedURR.resourceIds = [];
      }
      this.filteredAvailablePrograms = [];
      this.filteredAvailablePrograms = JSON.parse(JSON.stringify(this.availablePrograms));

    });
  }

  private async createAssignRequest() {

    let assignedResources:string[];

    if (this.orgBasedRoles.includes(this.selectedRole.name) && this.cannotChangeResources.includes(this.selectedRole.name) ){
      assignedResources=[this.currentUser.organizationId];
    } 
    else if (this.orgBasedRoles.includes(this.selectedRole.name)){
      assignedResources=[this.selectedOrganization.id];
    } 
    else { 
      if (this.cannotChangeResources.includes(this.selectedRole.name) ){
      // Get all the progIds from the selected 'assignedPrograms'
        assignedResources=["*"];
      } 
      else if (!this.assignedPrograms || this.assignedPrograms == null || this.assignedPrograms.length==0) {
        assignedResources=[];
      } 
      else if (  this.assignedPrograms.length==this.allcount) {
        // all are selected
        assignedResources=["*"];
      } 
      else {
        // some are selected
        assignedResources=[];
        this.assignedPrograms.forEach(function (value) {
          assignedResources.push( value.id );
        });
      }
  }

    // build the new request
    let request:AssignRoleRequest=new Object();
    request.userId = this.currentUser.id;
    request.communityId = this.currentUser.currentCommunityId;
    request.roleName = this.selectedRole.name;
    request.isNew=this.isNewUserRole;
    request.resourceIds=assignedResources;

    // Submit it
    try {
      await this.assignRoleRequestService.create(request).toPromise();
      NotifyUtil.notifySuccess("Your request has been submitted. Your will recieve an email once your request is processed.");
      this.assignRequests.push(request);
      this.selectedRole = null;
      this.clear();
      this.header.refreshActions();
    } catch(e) {
      NotifyUtil.notifyError(e.message);
    }
  }

  private async createDropRequest(){
    
    // build the new request
    let request:DropRoleRequest= new Object();
    request.userId = this.currentUser.id;
    request.communityId = this.currentUser.currentCommunityId;
    request.roleName = this.selectedRole.name;

    // Submit it
    try {
      await this.dropRoleRequestService.create(request).toPromise();
      NotifyUtil.notifySuccess("Your request has been submitted. Your will recieve an email once your request is processed.");
      this.dropRequests.push(request);
      this.selectedRole = null;
      this.clear();
      this.header.refreshActions();
    } catch(e) {
      NotifyUtil.notifySuccess(e.message);
    }
  }
  
  private filterByOrg(){

    this.filteredAvailablePrograms = [];
    if ( !this.selectedOrganization ){
      this.filteredAvailablePrograms = JSON.parse(JSON.stringify(this.availablePrograms));
    } else {
      this.availablePrograms.forEach ( prog =>  {

        if ( prog.organization == this.selectedOrganization.id ){
          this.filteredAvailablePrograms.push(prog);
        }
      }); 
    }
  }

  private clear(): void {

    this.submitted = false;
    this.isVisible = false;
    this.availablePrograms = [];
    this.assignedPrograms = [];
    this.selectedOrganization = this.organizations.find( org => org.id == this.myOrganization.id );
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
