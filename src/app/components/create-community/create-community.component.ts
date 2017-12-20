import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute, Params } from '@angular/router';
import { UserComponent } from '../user/user.component';
import { Observable } from 'rxjs/Observable';
import { CommunityService, RestResult } from '../../generated';
import { NgForOf } from '@angular/common/src/directives';


@Component({
  selector: 'app-create-community',
  templateUrl: './create-community.component.html',
  styleUrls: ['./create-community.component.css']
})
export class CreateCommunityComponent implements OnInit {

  private restResult: RestResult;

  constructor(
    public communityService: CommunityService,
  ){ 

  }

  ngOnInit() {
    let s = this.communityService.findall();
    s.subscribe(c => this.restResult = c);
  }

}
