import { Component, OnInit, ViewChild } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { NgForOf } from '@angular/common/src/directives';

// Other Components
import { HeaderComponent } from '../../../components/header/header.component';

// Generated
import { CommunityService } from '../../../generated';
import { RestResult } from '../../../generated';
import { Community } from '../../../generated';
import { UserService } from '../../../generated';
import { User } from '../../../generated';


@Component({
  selector: 'app-manage-communities',
  templateUrl: './manage-communities.component.html',
  styleUrls: ['./manage-communities.component.css']
})
export class ManageCommunitiesComponent implements OnInit {

  @ViewChild(HeaderComponent) header;

  status: any = {
    isFirstOpen: true,
    isFirstDisabled: false
  };

  communities: Community[]=[];
  users: User[]=[];
  newCommunity: Community;
  newapprover: string;
  resultError: string;

  constructor(
    public communityService: CommunityService,
    public userService: UserService,
  ) {

  }

  ngOnInit() {
    this.getCommunities();
    this.getUsers();
    this.newCommunity = new Object();
  }

  getCommunities(): void{
    let result: RestResult;
    this.communityService.findall()
      .subscribe(c => {
        result = c;
        this.resultError = result.error;
        this.communities = result.result;
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

  delete(community: Community) {

    console.log(community.name + " - " + community.id);

    let result: RestResult;
    this.communityService.deleteById(community.id)
    .subscribe(c => {
      result = c;
    });
    this.getCommunities();
  }

  addCommunity1() {

    this.newCommunity.approvers =[];
    this.newCommunity.approvers.push(this.newapprover);

    if (this.isValid()){

      let result: RestResult;
      let s = this.communityService.create(this.newCommunity);

      s.subscribe(r => {
        result = r;
        this.resultError = result.error;
        if (this.resultError == null) {
          this.communities.push(this.newCommunity);
        }
      });
    }
    else {
      console.log("Name of Id not unique");
      this.newCommunity = new Object();
    }
  }

  isValid(){
    let com:Community;
    for ( com of this.communities ){
      if (  com.name === this.newCommunity.name ||
            com.identifier === this.newCommunity.identifier ){
        return false;
      }
    }
    return true;
  }
}
