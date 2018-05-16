import { Component, OnInit, Input } from '@angular/core';

import { forkJoin } from "rxjs/observable/forkJoin";

import { UFR, POMService, Pom, MyDetailsService, CommunityService } from '../../../generated';

@Component({
  selector: 'ufr-tab',
  templateUrl: './ufr-tab.component.html',
  styleUrls: ['./ufr-tab.component.scss']
})
export class UfrTabComponent implements OnInit {
  @Input() current: UFR;
  private cycles: {}[] = [];

  constructor(private pomsvc: POMService, private communityService: CommunityService,
    private userDetailsService: MyDetailsService) { }

  ngOnInit() {
    var my: UfrTabComponent = this;
    this.userDetailsService.getCurrentUser().subscribe((person) => {
      forkJoin([
        //my.communityService.getById(person.result.currentCommunityId),
        my.pomsvc.getById(person.result.currentCommunityId)
        ]).subscribe(data => {
          data[0].result.forEach(function (pom: Pom) { 
            my.cycles.push({
              display: 'POM ' + pom.fy,
              pomid: pom.id
            });
          });

          console.log(my.cycles);
        });
    });
  }
}
