import {Component, EventEmitter, Input, OnChanges, Output} from '@angular/core';
import {
  AssignRoleRequest,
  AssignRoleRequestService,
  Community,
  DropRoleRequest,
  DropRoleRequestService,
  Organization,
  OrganizationService,
  Program,
  Role,
  RoleResourceType,
  User,
  UserRoleResource,
  UserRoleResourceService,
  UserService
} from '../../../generated';
import {DualListComponent} from 'angular-dual-listbox';
import {Notify} from '../../../utils/Notify';
import {ProgramAndPrService} from '../../../services/program-and-pr.service';
import {forkJoin} from 'rxjs/internal/observable/forkJoin';

@Component({
  selector: 'app-role-builder',
  templateUrl: './role-builder.component.html',
  styleUrls: ['./role-builder.component.scss']
})
export class RoleBuilderComponent implements OnChanges {

  @Input() allroles: Role[];
  @Input() selectedRole: Role;
  @Input() selectedUser: User;
  @Input() selectedCommunity: Community;
  @Input() isRequest: boolean;

  @Output()  okUrr = new EventEmitter<UserRoleResource>();
  @Output()  okAddRoleRequest = new EventEmitter<AssignRoleRequest>();
  @Output()  okDropRoleRequest = new EventEmitter<DropRoleRequest>();

  private organizations: Organization[] = [];
  private selectedOrganization: Organization;

  private selectedURR: UserRoleResource;

  private submitted: boolean = false;

  private isNewUserRole: boolean;

  private starOnlyRoles:string [] = [];
  private isStarOnlyRole: boolean;

  private orgBasedRoles: string [] = [];
  private isOrgBased: boolean;

  private selectedUserName: string;

  private addButtonText: string = "Assign";
  private dropButtonText: string = "Remove";

  // For the angular-dual-listbox
  private availablePrograms: Array<Program> = [];
  private filteredAvailablePrograms: Array<Program> = [];
  private assignedPrograms: Array<any> = [];
  private key: string = "shortName";
  private display: string = "shortName";
  private keepSorted = true;
  private filter = false;
  private format: any = { add: 'Available Programs', remove: 'Assigned Programs', all: 'Select All', none: 'Select None', direction: DualListComponent.RTL, draggable: true, locale: 'en' };
  private disabled = false;
  private allcount=0;

  constructor(private userRoleResourceService: UserRoleResourceService,
              private orgService: OrganizationService,
              private programAndPrService: ProgramAndPrService,
              private userService: UserService,
              private assignRoleRequestService: AssignRoleRequestService,
              private dropRoleRequestService:DropRoleRequestService) { }

  ngOnChanges() {

    if ( this.selectedCommunity && this.selectedRole && this.selectedUser ) {

      this.allroles.forEach(role => {

        if (role.resourceType === RoleResourceType.STAR_ONLY) {
          this.starOnlyRoles.push(role.name);
        } else if (role.resourceType === RoleResourceType.ORGANIZATION_ID) {
          this.orgBasedRoles.push(role.name);
        }
      });
     }

    if (this.isRequest){
      this.addButtonText="Submit Request";
      this.dropButtonText="Submit Request";
    }
    this.getURR();
  }


  private getURR(): void {

    this.selectedUserName = this.selectedUser.firstName + " " + this.selectedUser.middleInitial + " " + this.selectedUser.lastName;

    this.isStarOnlyRole = false;
    if ( this.starOnlyRoles.includes( this.selectedRole.name ) ) {
      this.isStarOnlyRole = true;
    }

    this.isOrgBased = false;
    if ( this.orgBasedRoles.includes( this.selectedRole.name ) ){
      this.isOrgBased = true;
    }

    this.isNewUserRole = true;

    forkJoin([
      this.userRoleResourceService.getUserRoleByUserAndCommunityAndRoleName(this.selectedUser.id, this.selectedCommunity.id, this.selectedRole.name),
      this.orgService.getByCommunityId((this.selectedCommunity.id)),
      this.programAndPrService.programsByCommunity(this.selectedCommunity.id),
      this.userService.getById(this.selectedUser.id)
    ]).subscribe(data => {

      let urr: UserRoleResource = data[0].result;
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
          let newAvail:Program[]=[];
          this.selectedURR.resourceIds.forEach( progShortName =>  {
            this.availablePrograms.forEach( prog => {
              if ( prog.shortName == progShortName ){
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

  private removeRole(){
    if (this.isRequest){
      this.createDropRequest();
    } else {
      this.dropRole();
    }
  }

  private addRole(){
    if (this.isRequest){
      this.createAssignRequest();
    } else {
      this.assignRole();
    }
  }

  private dropRole(): void {

    this.userRoleResourceService.deleteById(this.selectedURR.id).subscribe(() => {
      this.clear();
      this.submitted = true;
      Notify.success(this.getMessage(0));
      this.okUrr.emit( this.selectedURR );
    });
  }

  private assignRole(): void {

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
        this.assignedPrograms.forEach( (prog:Program) => this.selectedURR.resourceIds.push(prog.shortName));
      }
    }

    if (this.isNewUserRole){
      this.userRoleResourceService.create(this.selectedURR).subscribe(() => {
        this.clear();
        this.submitted = true;
        Notify.success(this.getMessage(1));
        this.okUrr.emit( this.selectedURR );
      });
    } else {
      this.userRoleResourceService.update(this.selectedURR).subscribe(() => {
        this.clear();
        this.submitted = true;
        Notify.success(this.getMessage(2));
        this.okUrr.emit( this.selectedURR );
      });
    }
  }

  private async createAssignRequest() {

    let assignedResources:string[];

    if ( this.selectedRole.resourceType === RoleResourceType.ORGANIZATION_ID  ){
      assignedResources=[this.selectedUser.organizationId];
    }
    else {
      if ( this.selectedRole.resourceType === RoleResourceType.STAR_ONLY ){
        // Get all the progIds from the selected 'assignedPrograms'
        assignedResources=["*"];
      }
      else if (!this.assignedPrograms || this.assignedPrograms == null || this.assignedPrograms.length==0) {
        assignedResources=["+"];
      }
      else if ( this.assignedPrograms.length==this.allcount) {
        // all are selected
        assignedResources=["*"];
      }
      else {
        // some are selected
        assignedResources=[];
        this.assignedPrograms.forEach(function (prog:Program) {
          assignedResources.push( prog.shortName );
        });
      }
    }

    // build the new request
    let request:AssignRoleRequest=new Object();
    request.userId = this.selectedUser.id;
    request.communityId = this.selectedUser.currentCommunityId;
    request.roleName = this.selectedRole.name;
    request.isNew=this.isNewUserRole;
    request.resourceIds=assignedResources;

    // Submit it
    try {
      await this.assignRoleRequestService.create(request).toPromise();
      Notify.success("Your request has been submitted. Your will receive an email once your request is processed.");
      this.clear();
      this.okAddRoleRequest.emit( request );
    } catch(e) {
      Notify.exception(e.message);
    }
  }

  private async createDropRequest(){

    // build the new request
    let request:DropRoleRequest= new Object();
    request.userId = this.selectedUser.id;
    request.communityId = this.selectedUser.currentCommunityId;
    request.roleName = this.selectedRole.name;

    // Submit it
    try {
      await this.dropRoleRequestService.create(request).toPromise();
      Notify.success("Your request has been submitted. Your will receive an email once your request is processed.");
      this.clear();
      this.okDropRoleRequest.emit( request );
    } catch(e) {
      Notify.success(e.message);
    }
  }

  private getMessage(messageNumber): string {

    let community_role_name = this.selectedCommunity.abbreviation + " : " + this.selectedRole.name;
    let message: string[] = [
      this.selectedUserName + " no longer has the role of " + community_role_name,
      this.selectedUserName + " has been assigned the role of " + community_role_name,
      this.selectedUserName + "'s resource access for " + community_role_name + " has been modified"
    ];
    return message[messageNumber];
  }

  private filterByOrg() {

    this.filteredAvailablePrograms = [];
    if (!this.selectedOrganization) {
      this.filteredAvailablePrograms = JSON.parse(JSON.stringify(this.availablePrograms));
    } else {
      this.availablePrograms.forEach(prog => {

        if (prog.organizationId == this.selectedOrganization.id) {
          this.filteredAvailablePrograms.push(prog);
        }
      });
    }
  }

  private clear(): void {
    this.submitted = false;
    this.availablePrograms = [];
    this.assignedPrograms = [];


  }

}
