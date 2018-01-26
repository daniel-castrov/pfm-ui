import { Component, OnInit, ViewChild } from '@angular/core';
import { CommunityService, RestResult, Community } from '../../generated';
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

  //private restResult: RestResult;

  status: any = {
    isFirstOpen: true,
    isFirstDisabled: false
  };

  communities: Community[] = [];
  resultError: string;

  constructor(
    public communityService: CommunityService,
  ) {

  }

  ngOnInit() {
    this.findAll();
  }

  findAll(): void {

    this.communities = [];
    let result: RestResult;
    this.communityService.findall()
      .subscribe(c => {
        result = c;

        this.resultError = result.error;

        let comm: Community;
        for (comm of result.result) {
          this.communities.push(comm);
        }
      });
  }

  delete(community: Community) {

    console.log(community.name + " - " + community.id);

    let result: RestResult;
    this.communityService.deleteById(community.id)
      .subscribe(c => {
        result = c;
      });
    this.findAll();
  }

  add(name) {
    this.resultError = null;
    let community: Community;
    community = new Object();
    community.name = name;
    //this.communities.push(community);

    let result: RestResult;
    let s = this.communityService.create(community);

    s.subscribe(r => {
      result = r;
      this.resultError = result.error;
      if (this.resultError == null) {
        this.communities.push(community);
      }
    });
  }

}
