import { Component, OnInit, Input } from '@angular/core';

import { forkJoin } from "rxjs/observable/forkJoin";

import { UFR, POMService, Pom, MyDetailsService, CommunityService } from '../../../generated';
import { Status } from '../status.enum';
import { Disposition } from '../disposition.enum';

@Component({
  selector: 'ufr-tab',
  templateUrl: './ufr-tab.component.html',
  styleUrls: ['./ufr-tab.component.scss']
})
export class UfrTabComponent implements OnInit {
  @Input() current: UFR;
  private cycles: {}[] = [];
  private statuses: string[] = [];
  private dispositions: string[] = [];
  

  constructor(private pomsvc: POMService, private communityService: CommunityService,
    private userDetailsService: MyDetailsService) { 

    this.dispositions = Object.keys(Disposition)
      .filter(k => typeof Disposition[k] === "number") as string[];
    this.statuses = Object.keys(Status)
      .filter(k => typeof Status[k] === "number") as string[];
  }

  ngOnInit() {
    var my: UfrTabComponent = this;
    this.userDetailsService.getCurrentUser().subscribe((person) => {
      forkJoin([
        //my.communityService.getById(person.result.currentCommunityId),
        my.pomsvc.getByCommunityId(person.result.currentCommunityId)
        ]).subscribe(data => {
          data[0].result.forEach(function (pom: Pom) { 
            my.cycles.push({
              display: 'POM ' + ( pom.fy-2000 ),
              pomid: pom.id
            });
          });

          // console.log(my.cycles);
        });
    });
  }
}
