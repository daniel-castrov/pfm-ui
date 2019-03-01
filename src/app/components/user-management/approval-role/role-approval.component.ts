import { Component, OnInit, ViewChild } from '@angular/core';
import { Router, ActivatedRoute, Params } from '@angular/router';
import { Observable } from 'rxjs';
// Other Components
import { JHeaderComponent } from '../../header/j-header/j-header.component';
import { Notify } from '../../../utils/Notify';

// Generated
import { User, Role, UserRoleResource } from '../../../generated';
import { UserService, RoleService, UserRoleResourceService, AssignRoleRequestService, DropRoleRequestService } from '../../../generated';

@Component({
  selector: 'app-role-approval',
  templateUrl: './role-approval.component.html',
  styleUrls: ['./role-approval.component.scss']
})
export class AccessChangeApprovalComponent implements OnInit {

  @ViewChild(JHeaderComponent) header;

  resultError: string[] = [];
  requestId: string;
  isDrop: boolean;
  requestService: any;
  request: any;
  requestingUser: User;

  requsetDisplay: RoleNameWithResources;
  currentRoles: RoleNameWithResources[] = [];

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private userService: UserService,
    private roleService: RoleService,
    private userRoleResourceService: UserRoleResourceService,
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

    this.request = (await this.requestService.getById( this.requestId ).toPromise()).result;
    this.requestingUser = (await this.userService.getById( this.request.userId ).toPromise()).result;
    let roles:Role[] = (await this.roleService.getByUserIdAndCommunityId( this.requestingUser.id, this.requestingUser.currentCommunityId ).toPromise()).result;

    roles.forEach(role => {
      this.userRoleResourceService.getUserRoleByUserAndCommunityAndRoleName(
        this.requestingUser.id, this.requestingUser.currentCommunityId, role.name
      ).subscribe((ur) => {
        let urr: UserRoleResource = ur.result;
        this.currentRoles.push( new RoleNameWithResources(role.name, urr.resourceIds) );
      });
    });
    if (this.isDrop){ 
      this.requsetDisplay = new RoleNameWithResources(this.request.roleName,  [] );
    } else {
      this.requsetDisplay = new RoleNameWithResources(this.request.roleName, this.request.resourceIds);
    }
  }

  approve() {
    this.submit("\"APPROVED\"");
  }

  deny() {
    this.submit("\"DENIED\"");
  }

  async submit(status) {
    try {
      await this.requestService.status(status, this.request.id).toPromise();
      this.router.navigate(['./home']);
    } catch (e) {
      Notify.exception(e.message);
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
