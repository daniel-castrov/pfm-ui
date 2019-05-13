import {Component, ViewChild} from '@angular/core';
import {ActivatedRoute, Router} from '@angular/router';
import {ProgramAndPrService} from '../../../services/program-and-pr.service';
import {
  AssignRoleRequest,
  AssignRoleRequestService,
  Community,
  CommunityService,
  DropRoleRequest,
  DropRoleRequestService,
  MyDetailsService,
  Organization,
  OrganizationService,
  Role,
  RoleService,
  User,
  UserRoleResource,
  UserRoleResourceService,
  RoleResourceType
} from '../../../generated';
import {AppHeaderComponent} from "../../header/app-header/app-header.component";
import {forkJoin} from 'rxjs/internal/observable/forkJoin';

@Component({
  selector: 'app-my-roles',
  templateUrl: './my-roles.component.html',
  styleUrls: ['./my-roles.component.scss']
})

export class MyRolesComponent {

  @ViewChild(AppHeaderComponent) header;

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

  private submitted: boolean = false;

  private isVisible: boolean;
  private requestExists: boolean;


  private hiddenRoles: string [] = ["Organization_Member", "User" ];

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private communityService: CommunityService,
    private roleService: RoleService,
    private userRoleResourceService: UserRoleResourceService,
    private orgService: OrganizationService,
    private programAndPrService: ProgramAndPrService,
    private myDetailsService:MyDetailsService,
    private assignRoleRequestService: AssignRoleRequestService,
    private dropRoleRequestService:DropRoleRequestService,
  ) {
  }

  public ngOnInit() {
    this.getUserAndRolesAndRequests();
  }

  private getUserAndRolesAndRequests():void {

    // get the current user
    this.myDetailsService.getCurrentUser().subscribe((u) => {
      this.resultError.push(u.error);
      this.currentUser=u.result;

      forkJoin([
        this.communityService.getById( this.currentUser.currentCommunityId ),
        this.orgService.getById(this.currentUser.organizationId),
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

        this.resultError.push(data[2].error);
        this.currentRoles =data[2].result;
        this.currentRoles = this.currentRoles.filter( role => !this.hiddenRoles.includes( role.name ) );

        this.currentRoles.forEach( role => {

          if (role.resourceType === RoleResourceType.ORGANIZATION_ID) {

            this.currentRolesWithResources.push(new RoleNameWithResources(role, ["Organization: " + this.myOrganization.abbreviation]));
          } else {
            this.userRoleResourceService.getUserRoleByUserAndCommunityAndRoleName(
              this.currentUser.id, this.currentUser.currentCommunityId, role.name
            ).subscribe((ur) => {
              let urr: UserRoleResource;
              urr = ur.result;
              this.currentRolesWithResources.push(new RoleNameWithResources(role, urr.resourceIds));
            });
          }
        });

        // Get all the roles
        this.resultError.push(data[3].error);
        this.roles=data[3].result;
        this.roles = this.roles.filter( role => !this.hiddenRoles.includes( role.name ) );

        // get any existing add requests
        this.resultError.push(data[4].error);
        this.assignRequests=data[4].result;

        // get any existing drop requests
        this.resultError.push(data[5].error);
        this.dropRequests=data[5].result;

        this.resultError.push(data[6].error);
        this.organizations=data[6].result;
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
      this.isVisible =true;
    }
  }

  addRequest(request:AssignRoleRequest){
    this.clear();
    this.assignRequests.push(request);
    this.header.refresh();
  }

  dropRequest(request:DropRoleRequest){
    this.clear();
    this.dropRequests.push(request);
    this.header.refresh();

  }

  private clear(): void {
    this.submitted = false;
    this.isVisible = false;
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
