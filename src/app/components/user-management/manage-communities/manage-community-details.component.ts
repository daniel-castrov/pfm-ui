import { AccordionModule } from 'ngx-bootstrap/accordion';
import { Component, OnInit, ViewChild } from '@angular/core';

import { Router, ActivatedRoute, Params } from '@angular/router';
// Other Components
import { HeaderComponent } from '../../../components/header/header.component';

// Generated
import { User } from '../../../generated/model/user';
import { RestResult } from '../../../generated/model/restResult';
import { CommunityService } from '../../../generated/api/community.service';
import { Community } from '../../../generated/model/community';
import { UserService } from '../../../generated/api/user.service';
import { Role } from '../../../generated/model/role'
import { RoleService } from '../../../generated/api/role.service';
import { UserRole } from '../../../generated/model/userRole'
import { UserRoleService } from '../../../generated/api/userRole.service';

@Component({
  selector: 'app-manage-community-details',
  templateUrl: './manage-community-details.component.html',
  styleUrls: ['./manage-community-details.component.css']
})
export class MamageCommunityDetailsComponent implements OnInit {

  @ViewChild(HeaderComponent) header;

  // This is the id of the user we are interested in ... the targetUser
  id: string;

  approvers: User[]=[];
  addedapprover:string;
  resultError: string[]=[];
  community: Community;
  users:User[]=[];


  programs: string[]=[];


  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private userService: UserService,
    private communityService: CommunityService,
    private roleService:RoleService,
    private userRoleService:UserRoleService,

  ) {
    this.route.params.subscribe((params: Params) => {
      this.id = params.id;
    });

  }

  ngOnInit() {
    this.getCommunity();
    this.getPrograms();
    this.getUsers();
  }

private getPrograms(): void {


  this.programs.push("DATFASTTRAC");
  this.programs.push("ENOOP");
  this.programs.push("LSPTTRUST");
  this.programs.push("POS SYSTEMS");
  this.programs.push("VTRST");
  

}

  private getCommunity(): void {
    this.approvers=[];

    let result: RestResult;
    let s = this.communityService.getById(this.id)
    .subscribe(r => {
      result = r;
      this.resultError.push(result.error);
      this.community = result.result;

      console.log(this.community );

      let resultAppr: RestResult;
      this.userService.getByCommunityIdAndRoleName(this.id,"User_Approver")
        .subscribe(r => {
          resultAppr = r;
          this.resultError.push(resultAppr.error);
          this.approvers = resultAppr.result;
        });
    });
  }

  getUsers(): void{
    let result:RestResult;
    this.userService.getAll()
    .subscribe(c => {
      result = c;
      this.resultError.push(result.error);
      this.users=result.result;
    });
  }

  private addApprover():void {

    console.log("addApprover" + this.addedapprover);

    //TODO: push(the new approver);

    let result: RestResult;
    let s = this.communityService.update(this.community);

    s.subscribe(r => {
      result = r;
      this.resultError.push(result.error);
      if (this.resultError == null) {
        this.community = result.result;
      }
    });


    let user:User;
    let result2:RestResult;
    this.userService.getById(this.addedapprover)
    .subscribe(r2 => {
      result = r2;
      this.resultError.push(result2.error);
      user=result.result;

      let result3: RestResult;
      // TODO: Assign the approver
    });
    
    this.getCommunity();
  }

}
