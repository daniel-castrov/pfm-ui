import { Component, OnInit, Input } from '@angular/core';
import { forkJoin } from "rxjs/observable/forkJoin";

import { Program, FundingLine, IntMap, UFR, POMService, Pom, PRService, PBService, ProgrammaticRequest } from '../../../generated';

@Component({
  selector: 'ufr-funds',
  templateUrl: './ufr-funds.component.html',
  styleUrls: ['./ufr-funds.component.scss']
})
export class UfrFundsComponent implements OnInit {
  @Input() current: UFR;
  private pom: Pom;
  private fy: number = new Date().getFullYear() + 2;
  private uvals: Map<number, number> = new Map<number, number>();
  private cvals: Map<number, number> = new Map<number, number>();
  private diffs: {} = {};
  
  
  constructor(private pomsvc: POMService, private pbService: PBService,
    private prService: PRService) { }

  ngOnInit() {
    // FIXME: we need to fetch the given programmatic request from the pom
    // we can find it based on originalProgramId of the UFR

    var my: UfrFundsComponent = this;
    
    console.log('ufrfunds');
    console.log(my.current);

    this.pomsvc.getById(this.current.pomId).subscribe(data => { 
      my.pom = data.result;
      my.fy = my.pom.fy;
      //console.log(my.fy);
      //console.log(my.pom);
      my.sumfunds();

    
      my.pbService.getByCommunityAndYear(my.pom.communityId, my.fy - 2).subscribe(pb => {
        my.prService.getByPhase(pb.result.id).subscribe(prs => { 
          prs.result.forEach(function (pr) { 

          });
        });
      });


    });

    //console.log(this.current);
  }

  onedit( newval, appr, blin, year ) {
    var my: UfrFundsComponent = this;

    var thisyear = Number.parseInt(year);
    my.current.funding.forEach(function (fund) {
      if (fund.appropriation === appr && fund.blin === blin) {
        fund.funds[thisyear] = Number.parseFloat( newval );
      }
    });

    this.sumfunds();
  }

  sumfunds(){
    var my: UfrFundsComponent = this;
    // console.log('into sumfunds!');
    
    // FIXME: need to start by summing up the PR data
    // then add/subtract the values from this UFR
    this.cvals.clear();
    this.uvals.clear();
    this.diffs = {};
    var years: number[] = [];
    for (var year = my.pom.fy - 4; year < my.pom.fy + 5; year++) {
      years.push(year);
    }

    years.forEach(function (year) { 
      my.uvals.set(year, 0);
      my.cvals.set(year, 0);
      my.diffs[year] = 0;;
    });

    my.current.funding.forEach(function (fund) { 
      Object.keys(fund.funds).forEach(function (yearstr) { 
        var year = Number.parseInt(yearstr);
        my.uvals.set(year, my.uvals.get(year) + fund.funds[year]);        
      });
    });

    years.forEach(function (year) {
      my.diffs[year] = (my.uvals.get(year) - my.cvals.get(year));
    });

    //console.log(my.uvals);
    //console.log(my.diffs);
  }
}

interface PbUfrRow{
  appropriation: string,
  blin: string,
  pb: ProgrammaticRequest,
  ufr:UFR
};