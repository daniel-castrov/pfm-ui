import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute, Params } from '@angular/router';
import { Observable } from 'rxjs/Observable';
import { CommunityService, RestResult, Community } from '../../generated';
import { NgForOf } from '@angular/common/src/directives';
import { AccordionModule } from 'primeng/accordion';


@Component({
  selector: 'app-create-community',
  templateUrl: './create-community.component.html',
  styleUrls: ['./create-community.component.css']
})
export class CreateCommunityComponent implements OnInit {

  //private restResult: RestResult;

  communities: Community[]=[];
  resultError: string;

  constructor(
    public communityService: CommunityService,
  ) {

  }

  ngOnInit() {
    this.findAll();
  }

  findAll(): void{

    this.communities = [];
    let result:RestResult;
    this.communityService.findall()
    .subscribe(c => {
      result = c;

      this.resultError=result.error;

      let comm:Community;
      for ( comm of result.result ){
        this.communities.push(comm);
      }
    });
  }

  delete(community: Community){

    console.log(community.name + " - " +  community.id);

    let result:RestResult;
    this.communityService.deleteById(community.id)
    .subscribe(c => {
      result = c;
    });
    this.findAll();
  }

  add(name) {
    this.resultError=null;
    let community:Community;
    community = new Object();
    community.name=name;
    //this.communities.push(community);

    let result:RestResult;
    let s=this.communityService.create(community);

    s.subscribe(r => {
      result=r;
      this.resultError=result.error;
      if ( this.resultError == null ){
        this.communities.push(community);
      }
    });
  }

}
