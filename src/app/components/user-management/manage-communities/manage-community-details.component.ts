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
  resultError: string;
  community: Community;
  users:User[]=[];


  programs: string[]=[];


  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private userService: UserService,
    private communityService: CommunityService,

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
    let s = this.communityService.getById(this.id);

    s.subscribe(r => {
      result = r;
      this.resultError = result.error;
      if (this.resultError == null) {
        this.community = result.result;
      }

      
      let appr: string;
      for (appr of this.community.approverIds) {
        let result: RestResult;
        this.userService.get(appr)
          .subscribe(c => {
            result = c;
            this.resultError = result.error;
             this.approvers.push(result.result);
          });
      }
    });
  }

  getUsers(): void{
    let result:RestResult;
    this.userService.getAllUsers()
    .subscribe(c => {
      result = c;
      this.resultError = result.error;
      this.users=result.result;
    });
  }

  private addApprover():void {

    console.log("addApprover" + this.addedapprover);

    this.community.approverIds.push(this.addedapprover);

    let result: RestResult;
    let s = this.communityService.updateCommunity(this.community);

    s.subscribe(r => {
      result = r;
      this.resultError = result.error;
      if (this.resultError == null) {
        this.community = result.result;
      }
    });
    this.getCommunity();
  }

  private deleteCommunity():void {

    console.log("Delete Community");

    let result: RestResult;
    let s = this.communityService.deleteById(this.community.id);
    s.subscribe(r => {
      result = r;
      this.resultError = result.error;
      if (this.resultError == null) {
        result.result;
      }
      this.router.navigate(['/manage-communities']);
    });
  }
}