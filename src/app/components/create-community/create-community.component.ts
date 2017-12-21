import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute, Params } from '@angular/router';
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

  private communities: any[];
  private community: { name: '' };

  constructor(
    public communityService: CommunityService,
  ) {

  }

  ngOnInit() {
    let s = this.communityService.findall();
    s.subscribe(c => this.restResult = c);
  }

  onSubmit() {
    this.communityService.create(this.community).subscribe(community => {
      this.communities.push(community);
    });
  }

}
