import { Component, OnInit, ViewChild } from '@angular/core';
import { Router, ActivatedRoute, Params } from '@angular/router';
import { Observable } from 'rxjs';
import { AngularDualListBoxModule } from 'angular-dual-listbox';
import { DualListComponent } from 'angular-dual-listbox';

// Other Components
import { HeaderComponent } from '../../header/header.component';
import { FeedbackComponent } from '../../feedback/feedback.component';
import { WithFullNameService, ProgramWithFullName } from '../../../services/with-full-name.service';

// Generated
import { RestResult, Community, Role, UserRoleResource, User, Organization }  from '../../../generated';
import { CommunityService, RoleService, UserRoleResourceService, UserService, OrganizationService,} from '../../../generated';

@Component({
  selector: 'app-manage-roles',
  templateUrl: './manage-roles.component.html',
  styleUrls: ['./manage-roles.component.scss']
})

export class ManageRolesComponent {

  @ViewChild(HeaderComponent) header;
  @ViewChild(FeedbackComponent) feedback: FeedbackComponent;

  private resultError: string[] = [];

  private communities: Community[] = [];
  private organizations: Organization[] = [];
  private roles: Role[] = [];
  private users: User[] = [];
  
  private paramCommunityId: string="";
  private paramRoleId: string="";
  private paramUserId: string="";

  private selectedCommunity: Community;
  private selectedOrganization: Organization;
  
  private selectedRole: Role;
  private selectedUser: User;
  private selectedURR: UserRoleResource;

  private submitted: boolean = false;

  private isNewUserRole: boolean;
  private isVisible: boolean;

  private cannotChangeResources:string [] = ["User_Approver", "POM_Manager", "Funds_Requestor", "Program_Manager" ];
  private canChangeResources: boolean;

  private orgBasedRoles: string [] = ["Organization_Member", "Funds_Requestor", "Program_Manager" ];
  private isOrgBased: boolean;

  private cannotUnassign: string [] = ["Organization_Member", "User" ];
  private canUnassign: boolean;

  private selectedUserName: string;
  private submittedMessage = "no message";


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
  //private userAdd = '';
  //private sourceLeft = true;
  //private tab = 1;
  private allcount=0;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private communityService: CommunityService,
    private roleService: RoleService,
    private userService: UserService,
    private userRoleResourceService: UserRoleResourceService,
    private orgService: OrganizationService,
    private withFullNameService: WithFullNameService,
  ) { 

    this.route.params.subscribe((params: Params) => {
      this.paramCommunityId= params.commid;
      this.paramRoleId=params.roleid;
      this.paramUserId=params.userid;
    });
  }

  public ngOnInit() {
    this.getCommunities();
  }

  private getCommunities(): void {

    let result: RestResult;
    this.communityService.getAll()
      .subscribe(c => {
        result = c;
        this.resultError.push(result.error);
        this.communities = result.result;

        // See if the community is already in the params. 
        this.communities.forEach( comm => { 
          if(comm.id===this.paramCommunityId){ 
            this.selectedCommunity=comm;
            this.getRolesAndUsers();
            return; 
          }  
        });

        if (null == this.communities || this.communities.length == 0) {
          this.resultError.push("No Communities were found");
          return;
        }
      });
  }

  private getRolesAndUsers(): void {

    this.clear();
    this.selectedRole = null;
    this.selectedUser = null;

    Observable.forkJoin([
      this.roleService.getByCommunityId(this.selectedCommunity.id),
      this.userService.getByCommId(this.selectedCommunity.id)
    ]).subscribe(data => {
      this.resultError.push(data[0].error);
      this.roles = data[0].result;
      this.resultError.push(data[1].error);
      this.users = data[1].result;

      // See if the role and and user are already in the params. 
      this.roles.forEach( role => { 
        if(role.id===this.paramRoleId){ 
          this.selectedRole=role;
          return;
        }  
      });
      this.users.forEach( user => { 
        if(user.id===this.paramUserId){ 
          this.selectedUser=user;
          return;
        }  
      });
      if( this.selectedCommunity && this.selectedRole && this.selectedUser ) {
        this.getURR();
      }

    });
  }

  private getURR(): void {

    this.clear();
    this.selectedUserName = this.selectedUser.firstName + " " + this.selectedUser.middleInitial + " " + this.selectedUser.lastName;

    this.canChangeResources = false;
    if ( !this.cannotChangeResources.includes( this.selectedRole.name ) ) {
      this.canChangeResources = true;
    } 

    this.isOrgBased = false;
    if ( this.orgBasedRoles.includes( this.selectedRole.name ) ){
      this.isOrgBased = true;
    }

    this.canUnassign = true;
    if ( this.cannotUnassign.includes( this.selectedRole.name ) ){
      this.canUnassign = false;
    }

    this.isVisible = true;
    this.isNewUserRole = true;

    Observable.forkJoin([
      this.userRoleResourceService.getUserRoleByUserAndCommunityAndRoleName(this.selectedUser.id, this.selectedCommunity.id, this.selectedRole.name),
      this.orgService.getByCommunityId((this.selectedCommunity.id)),
      this.withFullNameService.programsByCommunity(this.selectedCommunity.id),
      this.userService.getById(this.selectedUser.id)
    ]).subscribe(data => {

      this.resultError.push(data[0].error);
      let urr: UserRoleResource = data[0].result;

      this.resultError.push(data[1].error);
      this.organizations = data[1].result;

      this.availablePrograms = data[2];
      
      let refreshedUser:User = data[3].result;
      this.selectedUser.organizationId = refreshedUser.organizationId;
      
      if (urr) {
        this.isNewUserRole = false;
        this.selectedURR = urr;
        if ( this.isOrgBased && urr.resourceIds[0] ) {
          // pre-populate the org drop down  
          this.selectedOrganization = this.organizations.find( org => org.id == urr.resourceIds[0] );
        }
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
        this.selectedOrganization = this.organizations.find( org => org.id == this.selectedUser.organizationId );
        this.selectedURR = new Object();
        this.selectedURR.userId = this.selectedUser.id;
        this.selectedURR.roleId = this.selectedRole.id;
        this.selectedURR.resourceIds = [];
      }
      this.filteredAvailablePrograms = [];
      this.filteredAvailablePrograms = JSON.parse(JSON.stringify(this.availablePrograms));

    });
  }

  private commitUnassign(): void {

    this.userRoleResourceService.deleteById(this.selectedURR.id).subscribe(() => { 
      this.clear(); 
      this.feedback.success(this.getMessage(0));
    });
  }

  private commit(): void {

    if ( this.isOrgBased ){
      this.selectedURR.resourceIds= [this.selectedOrganization.id];
    } else {
      if (!this.assignedPrograms || this.assignedPrograms == null || this.assignedPrograms.length==0) {
        // none are selected
        this.selectedURR.resourceIds=[];
      } else if (this.assignedPrograms.length==this.allcount) {
        // all are selected
        this.selectedURR.resourceIds=["*"];
      } else {
        // some are selected
        this.selectedURR.resourceIds=[];
        this.assignedPrograms.forEach( (value) => this.selectedURR.resourceIds.push(value.id));
      }
    }

    console.log( this.selectedURR );

    if (this.isNewUserRole){
      this.userRoleResourceService.create(this.selectedURR).subscribe(() => {
        this.clear(); 
        this.feedback.success(this.getMessage(1));
      });
    } else {
      this.userRoleResourceService.update(this.selectedURR).subscribe(() => {
        this.clear(); 
        this.feedback.success(this.getMessage(2));
      });
    }
  }

  private getMessage(messageNumber): string {

    let community_role_name = this.selectedCommunity.abbreviation + " : " + this.selectedRole.name;
    let message: string[] = [
      this.selectedUserName + " no longer has the role of " + community_role_name,
      this.selectedUserName + " has been assigned the role of " + community_role_name,
      this.selectedUserName + "'s resource access for "+community_role_name+" has been modified"
    ];
    this.submitted = true;
    return  message[messageNumber];
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
    this.selectedOrganization = null;
  }

  private okNext(): boolean {

    if ((!this.selectedRole || this.selectedRole == null || this.selectedRole === "")) {
      return false;
    }
    if ((!this.selectedUser || this.selectedUser == null || this.selectedUser === "")) {
      return false;
    }
    return true;
  }

}
