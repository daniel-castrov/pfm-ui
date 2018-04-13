import { Component, OnInit, ViewChild } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { NgForOf } from '@angular/common/src/directives';
import { Router, ActivatedRoute, Params } from '@angular/router';

// Other Components
import { HeaderComponent } from '../../../components/header/header.component';

// Generated
import { CommunityService } from '../../../generated';
import { RestResult } from '../../../generated';
import { Community } from '../../../generated';
import { Role } from '../../../generated/model/role'
import { RoleService } from '../../../generated/api/role.service';
import { UserRole } from '../../../generated/model/userRole'
import { UserRoleService } from '../../../generated/api/userRole.service';

import { UserService } from '../../../generated/api/user.service';
import { User } from '../../../generated/model/user';


@Component({
  selector: 'app-manage-communities',
  templateUrl: './manage-communities.component.html',
  styleUrls: ['./manage-communities.component.scss']
})
export class ManageCommunitiesComponent implements OnInit {

  @ViewChild(HeaderComponent) header;

  status: any = {
    isFirstOpen: true,
    isFirstDisabled: false
  };

  communities: Community[] = [];
  users: User[] = [];
  newCommunity: Community;
  newapprover: string;
  resultError: string[] = [];

  constructor(
    private router: Router,
    public communityService: CommunityService,
    public userService: UserService,
    private roleService: RoleService,
    private userRoleService: UserRoleService,
  ) {

  }

  ngOnInit() {
    this.getCommunities();
    this.getUsers();
    this.newCommunity = new Object();
  }

  getCommunities(): void {
    let result: RestResult;
    this.communityService.getAll()
      .subscribe(c => {
        result = c;
        this.resultError.push(result.error);
        this.communities = result.result;

        if (null == this.communities || this.communities.length == 0) {
          this.resultError.push("No Communities were found");
          return;
        }

      });
  }

  getUsers(): void {
    let result: RestResult;
    this.userService.getAll()
      .subscribe(c => {
        result = c;
        this.resultError.push(result.error);
        this.users = result.result;
      });
  }



  addCommunity():void {

    if (!this.isValid()) {
      let errorString = "The new community name or identifier is not unique";
      console.log(errorString);
      this.resultError.push(errorString);
    } else {

      console.log(this.newapprover);
      console.log(this.newCommunity);

      let resultCom: RestResult;
      this.communityService.create(this.newCommunity)
        .subscribe(r => {
          resultCom = r;
          this.resultError.push(resultCom.error);
          this.newCommunity = resultCom.result;

          console.log(this.newCommunity);

          // Get the Roles
          Observable.forkJoin([
            this.roleService.getByNameAndCommunityId(this.newCommunity.id, "User"),
            this.roleService.getByNameAndCommunityId(this.newCommunity.id, "User_Approver")

          ]).subscribe(data => {

            // create the userUserRole
            let userRole: Role;
            userRole = data[0].result;
            let userUserRole: UserRole = new Object();
            userUserRole.roleId = userRole.id;
            userUserRole.userId = this.newapprover;
            console.log(userUserRole);

            // create the approverUserRole
            let approverRole: Role;
            approverRole = data[1].result;
            let appUserRole: UserRole = new Object();
            appUserRole.roleId = approverRole.id;
            appUserRole.userId = this.newapprover;
            console.log(appUserRole);

            // Save both new userRoles
            Observable.forkJoin([
              this.userRoleService.create(userUserRole),
              this.userRoleService.create(appUserRole)
            ]).subscribe(data2 => {
              this.communities.push(this.newCommunity);
              this.router.navigate(['/manage-communities']);
            });
          });
        });
    }
  }

  isValid() {
    let com: Community;
    for (com of this.communities) {
      if (com.name === this.newCommunity.name ||
        com.abbreviation === this.newCommunity.abbreviation) {
        return false;
      }
    }
    return true;
  }
}
