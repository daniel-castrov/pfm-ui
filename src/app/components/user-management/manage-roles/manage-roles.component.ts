import {Component} from '@angular/core';
import {ActivatedRoute, Params, Router} from '@angular/router';
import {Community, CommunityService, RestResult, Role, RoleService, User, UserRoleResource, UserService,} from '../../../generated';
import {forkJoin} from 'rxjs/internal/observable/forkJoin';

@Component({
  selector: 'app-manage-roles',
  templateUrl: './manage-roles.component.html',
  styleUrls: ['./manage-roles.component.scss']
})

export class ManageRolesComponent {

  private communities: Community[] = [];
  private roles: Role[] = [];
  private users: User[] = [];
  
  private paramCommunityId: string="";
  private paramRoleId: string="";
  private paramUserId: string="";

  private selectedCommunity: Community;
  private selectedRole: Role;
  private selectedUser: User;

  private hiddenRoles: string [] = ["Organization_Member", "User" ];

  private showRoleBuilder: boolean = false;


  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private communityService: CommunityService,
    private roleService: RoleService,
    private userService: UserService
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
          return;
        }
      });
  }

  private getRolesAndUsers(): void {

    this.clear();
    this.selectedRole = null;
    this.selectedUser = null;

    forkJoin([
      this.roleService.getByCommunityId(this.selectedCommunity.id),
      this.userService.getByCommId(this.selectedCommunity.id)
    ]).subscribe(data => {
      this.roles = data[0].result;

      this.users = data[1].result;
      this.roles = this.roles.filter( role => !this.hiddenRoles.includes( role.name ) );

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
    });
  }

  okUrr(urr:UserRoleResource){
    this.clear();
  }

  private clear(){
    this.showRoleBuilder = false;
  }

  private next(){
    this.showRoleBuilder = true;
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
