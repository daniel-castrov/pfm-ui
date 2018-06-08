import { Component, OnInit, ViewChild } from '@angular/core';
import { Router, ActivatedRoute, Params } from '@angular/router';
import { Observable } from 'rxjs';
// Other Components
import { HeaderComponent } from '../../../components/header/header.component';
import { FeedbackComponent } from '../../feedback/feedback.component';
// Generated
import { Community, Program, User, Role, UserRoleResource, AssignRoleRequest, DropRoleRequest } from '../../../generated';
import { UserService, RoleService, UserRoleResourceService, ProgramsService, AssignRoleRequestService, DropRoleRequestService } from '../../../generated';

@Component({
  selector: 'app-role-approval',
  templateUrl: './role-approval.component.html',
  styleUrls: ['./role-approval.component.scss']
})
export class AccessChangeApprovalComponent implements OnInit {

  @ViewChild(HeaderComponent) header;
  @ViewChild(FeedbackComponent) feedback: FeedbackComponent;

  resultError: string[] = [];
  requestId: string;
  isDrop: boolean;
  requestService: any;
  request: any;
  requestingUser: User;

  requsetDisplay: RoleNameWithResources;
  currentRoles: RoleNameWithResources[] = [];


  pogramsMap: any[] = [];

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private userService: UserService,
    private roleService: RoleService,
    private userRoleResourceService: UserRoleResourceService,
    private programsService: ProgramsService,
    private assignRoleRequestService: AssignRoleRequestService,
    private dropRoleRequestService: DropRoleRequestService
  ) {

    this.route.params.subscribe((params: Params) => {
      this.requestId = params.requestId;
      let assignOrDrop:string = params.assignDrop;
      if (assignOrDrop === "drop") {
        this.isDrop=true;
      }  else if (assignOrDrop === "assign") {
        this.isDrop=false;
      } else {
        this.router.navigate(['/not-found']);
      }
      this.init();
    });
  }

  ngOnInit(){
    this.resultError = [];
  }

  init() {
    this.requsetDisplay=null;
    this.currentRoles=[];

    if ( this.isDrop ) {
      this.requestService = this.dropRoleRequestService;
    } else{
      this.requestService = this.assignRoleRequestService;
    }
    this.getUserAndRoles();
  }


  private async getUserAndRoles() {

    this.request = (await this.requestService.getById(this.requestId).toPromise()).result;
    this.requestingUser = (await this.userService.getById(this.request.userId).toPromise()).result;
    
    Observable.forkJoin([
      this.programsService.getProgramsByCommunity(this.requestingUser.currentCommunityId),
      this.roleService.getByUserIdAndCommunityId(this.requestingUser.id, this.requestingUser.currentCommunityId)
    ]).toPromise().then( async r => {

      // Get all the programs and put them in a map
      this.resultError.push(r[0].error);
      let allPrograms = r[0].result;
      allPrograms.forEach(p => this.pogramsMap[p.id] = p);

      this.resultError.push(r[1].error);
      let roles: Role[] = r[1].result;

      roles.forEach(role => {
        this.userRoleResourceService.getUserRoleByUserAndCommunityAndRoleName(
          this.requestingUser.id, this.requestingUser.currentCommunityId, role.name
        ).subscribe((ur) => {
          let urr: UserRoleResource = ur.result;
          this.currentRoles.push(this.createRoleWithResource(role.name, urr.resourceIds));
        });
      });
      if (this.isDrop){ 
        this.requsetDisplay = this.createRoleWithResource(this.request.roleName, [...[]]);
      } else {
        this.requsetDisplay = this.createRoleWithResource(this.request.roleName, this.request.resourceIds);
      }
    });
  }

  createRoleWithResource(role: string, resourceIds: string[]): RoleNameWithResources {
    let progNames: string[] = [];
    resourceIds.forEach(r => {
      try {
        progNames.push(this.pogramsMap[r].shortName);
      } catch (any) {
        if ( r==="x" ) r="none";
        progNames.push(r);
      }
    });
    return new RoleNameWithResources(role, progNames);
  }

  approve() {
    this.submit("\"APPROVED\"");
  }

  deny() {
    this.submit("\"DENIED\"");
  }

  async submit(status) {
    try {
      await this.assignRoleRequestService.status(status, this.request.id).toPromise();
      this.router.navigate(['./home']);
    } catch (e) {
      this.feedback.failure(e.message);
    }
  }
}

// a class for viewing the current roles with the associated resources (program names)
class RoleNameWithResources {
  name: string;
  resources: string[];
  constructor(nm: string, re: string[]) {
    this.name = nm;
    if ( re.length===0 ) re=["none"];
    this.resources = re;
  }
}

