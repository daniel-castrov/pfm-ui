import { Component, OnInit, ViewChild } from '@angular/core';
import { CommunityService, RestResult, Community, UserService, User } from '../../generated';
import { HeaderComponent } from '../../components/header/header.component';
import { Observable } from 'rxjs/Observable';
import { NgForOf } from '@angular/common/src/directives';
import { Router, ActivatedRoute, Params } from '@angular/router';

@Component({
  selector: 'app-create-community',
  templateUrl: './create-community.component.html',
  styleUrls: ['./create-community.component.css']
})
export class CreateCommunityComponent implements OnInit {

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
    this.userService.findall()
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
