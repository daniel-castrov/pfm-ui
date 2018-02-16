import { Component, OnInit, ViewChild } from '@angular/core';
import * as $ from 'jquery';

// Other Components
import { HeaderComponent } from '../../../components/header/header.component';

// Generated
import { CommunityService } from '../../../generated';
import { RestResult } from '../../../generated';
import { Community } from '../../../generated';
import { UserService } from '../../../generated';
import { User } from '../../../generated';
import { MyDetailsService } from '../../../generated/api/myDetails.service';

declare const $: any;
declare const jQuery: any;

@Component({
  selector: 'app-request-community',
  templateUrl: './request-community.component.html',
  styleUrls: ['./request-community.component.css']
})
export class RequestCommunityComponent implements OnInit {

  @ViewChild(HeaderComponent) header;

  allcommunities: Community[] = [];
  reqcommunities: Community[] = [];
  avacommunities: Community[] = [];
  currentUser: User;

  constructor(

    public communityService: CommunityService,
    public userService: UserService,
    private userDetailsService: MyDetailsService,
  ) {

  }

  newCommunity: Community;
  resultError: string;

  public ngOnInit() {

    jQuery(document).ready(function ($) {
      $('#multiselect').multiselect();
    });


    this.buildCommunities();

  }


  buildCommunities():void{

    var result: RestResult;
    this.userDetailsService.getCurrentUser()
      .subscribe((c) => {
        result = c;
        this.currentUser = result.result;

        let result2: RestResult;
        this.communityService.findall()
          .subscribe(c => {
            result2 = c;
            this.resultError = result2.error;
            this.allcommunities = result2.result;

            for (let comm of this.allcommunities) {
              if (this.currentUser.communities.indexOf(comm.id) > -1) {
                this.reqcommunities.push(comm);
              } else {
                this.avacommunities.push(comm);
              }
            }
          });
      });
  }

  private submit():void{

    let comms:string[]=[];

    $("#multiselect option").each(function(){ comms.push($(this).val())});


    for(let c of comms ){
      console.log(c);
    }

    this.reqcommunities=[];
    for (let comm of this.allcommunities) {
      if (comms.indexOf(comm.id) > -1) {
        this.reqcommunities.push(comm);
      } 
    }
    for (let comm of this.reqcommunities) {
      console.log(comm.name);
    }
    

  }

  private cancel():void{
    this.allcommunities=[];
  this.reqcommunities= [];
  this.avacommunities= [];
    this.buildCommunities();
  }

}
