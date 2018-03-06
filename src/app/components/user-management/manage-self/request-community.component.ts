import { Component, OnInit, ViewChild } from '@angular/core';
import { Observable } from 'rxjs';
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

    var my: RequestCommunityComponent = this;
    Observable.forkJoin([
      my.communityService.getAll(),
      my.userDetailsService.getCurrentUser()
    ]).subscribe(data => {
      console.log(data);
      my.allcommunities = data[0].result;
      my.currentUser = data[1].result;

      // got all communities, and our user,
      // so see what communities our user is part of
      my.communityService.getByUserIdAndRoleName(my.currentUser.id, 'User').subscribe(roles => {
        var usercommids: Set<string> = new Set<string>();
        roles.result.forEach(function (x: Community) {
          usercommids.add(x.id);
        });
        my.reqcommunities = roles.result;
        my.avacommunities = my.allcommunities.filter(function (c: Community) {
          return (!usercommids.has(c.id));
        });
      });
    });
  }

  private reqall() {
    console.log('reqall');
  }
  private nreqall() {
    console.log('nreqall');
  }
  private reqone() {
    console.log('reqone');
  }
  private nreqone() {
    console.log('nreqone');
  }
}
  