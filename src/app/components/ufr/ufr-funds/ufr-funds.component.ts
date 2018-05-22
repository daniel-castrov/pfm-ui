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
  private model: ProgrammaticRequest;

  // key is appropriation-blin
  private modelfunds: Map<string, modelval> = new Map<string, modelval>();
  
  constructor(private pomsvc: POMService, private pbService: PBService,
    private prService: PRService) { }

  ngOnInit() {
    var my: UfrFundsComponent = this;
    
    this.pomsvc.getById(my.current.pomId).subscribe(data => { 
      my.pom = data.result;
      my.fy = my.pom.fy;

      console.log('into ufr-funds init!');
      console.log(my.current.fundingLines);

      my.cvals.clear();

      // get the original funding lines from the POM
      my.prService.getByPhaseAndShortName( my.pom.id, my.current.shortName ).subscribe( model=>{
        // get the current values for this program
        my.model = model.result;
        //console.log(my.model);

        my.model.fundingLines.forEach(function (fund) {
          var key = fund.appropriation + fund.blin;
          var val: modelval = {
            appropriation: fund.appropriation,
            blin: fund.blin,
            funds: fund.funds
          };

          Object.keys(fund.funds).forEach(function (yearstr) {
            var year: number = Number.parseInt(yearstr);
            if (!my.cvals.has(year)) {
              my.cvals.set(year, 0);
            }

            my.cvals.set(year, my.cvals.get(year) + fund.funds[year]);
          });

          my.modelfunds.set(key, val);
          
          // would like to call this only once, after all the endpoint calls
          my.sumfunds();
        });        
      });
    });

    //console.log(this.current);
  }

  onedit( newval, appr, blin, year ) {
    var my: UfrFundsComponent = this;
    console.log('editing ' + appr + '/' + blin + ' in ' + year + ' with val: ' + newval); 

    var thisyear = Number.parseInt(year);
    my.current.fundingLines.forEach(function (fund) {
      if (fund.appropriation === appr && fund.blin === blin) {
        console.log('found the fund, setting the value for ' + thisyear+' to '+Number.parseFloat(newval));
        console.log(fund.funds);
        console.log(fund.funds[thisyear]);
        fund.funds[thisyear] = Number.parseFloat(newval);
        console.log(fund.funds);
        console.log(fund.funds[thisyear]);
      }
    });

    this.sumfunds();
  }

  sumfunds(){
    var my: UfrFundsComponent = this;
    console.log('into sumfunds!');
    
    // remember: cvals get set only once
    this.uvals.clear();
    this.diffs = {};
    var years: number[] = [];
    for (var year = my.pom.fy - 4; year < my.pom.fy + 5; year++) {
      years.push(year);
    }

    years.forEach(function (year) { 
      my.uvals.set(year, 0);
      my.diffs[year] = 0;
    });

    my.current.fundingLines.forEach(function (fund) { 
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
    //console.log(my.modelfunds);
  }
}

interface PbUfrRow{
  appropriation: string,
  blin: string,
  pb: ProgrammaticRequest,
  ufr:UFR
};

interface modelval {
  appropriation: string,
  blin: string,
  funds: Map<number, number>;
}
