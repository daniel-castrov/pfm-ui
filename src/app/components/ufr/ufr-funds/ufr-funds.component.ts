import { Component, OnInit, Input, ApplicationRef } from '@angular/core'
import { forkJoin } from "rxjs/observable/forkJoin"

import {
  Program, FundingLine, IntMap, UFR, POMService,
  Pom, PRService, PBService, ProgrammaticRequest
} from '../../../generated'

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
  // key is appropriation+blin
  private rows: Map<string, tabledata> = new Map<string, tabledata>();

  constructor(private pomsvc: POMService, private pbService: PBService,
    private prService: PRService) { }

  ngOnInit() {
    var my: UfrFundsComponent = this;
    
    this.pomsvc.getById(my.current.pomId).subscribe(data => { 
      my.pom = data.result;
      my.fy = my.pom.fy;

      console.log('into ufr-funds init!');
      
      // get the data from the UFR into our tabledata structure
      my.current.fundingLines.forEach(fund => { 
        var key = fund.appropriation + fund.blin;
        var cfunds: Map<number, number> = new Map<number, number>();
        var tfunds: Map<number, number> = new Map<number, number>();
        var mfunds: Map<number, number> = new Map<number, number>();

        Object.keys(fund.funds).forEach(function (yearstr) {
          var year: number = Number.parseInt(yearstr);
          cfunds.set(year, Number.parseInt(fund.funds[yearstr]));
          tfunds.set(year, Number.parseInt(fund.funds[yearstr]));
          mfunds.set(year, 0);
        });

        my.rows.set(key, {
          blin: fund.blin,
          appropriation: fund.appropriation,
          ufrfunds: cfunds,
          totalfunds: tfunds,
          modelfunds: mfunds
        });
      });

      // ...now merge/add the original funding lines from the POM
      my.prService.getByPhaseAndShortName( my.pom.id, my.current.shortName ).subscribe( model=>{
        // get the current values for this program
        my.model = model.result;
        console.log(my.model);

        my.model.fundingLines.forEach(fund=> {
          var key = fund.appropriation + fund.blin;

          var newdata = false;
          if (!my.rows.has(key)) {
            my.rows.set(key, {
              appropriation: fund.appropriation,
              blin: fund.blin,
              modelfunds: new Map<number, number>(),
              ufrfunds: new Map<number, number>(),
              totalfunds: new Map<number, number>()
            });
            newdata = true;
          }
          var thisrow: tabledata = my.rows.get(key);

          Object.keys(fund.funds).forEach(function (yearstr) {
            var year: number = Number.parseInt(yearstr);
            var amt: number = Number.parseInt(fund.funds[yearstr]);
            thisrow.modelfunds.set(year, amt);
            if (!thisrow.ufrfunds.has(year)) {
              thisrow.ufrfunds.set(year, 0);
            }
            thisrow.totalfunds.set(year, thisrow.ufrfunds.get(year) + amt);
          });
        });
      });
    });
  }

  onedit(newval, appr, blin, year) {
    var my: UfrFundsComponent = this;
    console.log('editing ' + appr + '/' + blin + ' in ' + year + ' with val: ' + newval); 


    var thisyear = Number.parseInt(year);
    var thisvalue = Number.parseInt(newval);
    if (''===newval || Number.isNaN(thisvalue)) {
      thisvalue = 0;
    }

    var thisrow = this.rows.get(appr + blin);

    if (!thisrow.totalfunds.has(year)) {
      thisrow.totalfunds.set(year, 0);
    }

    var oldvalue = (thisrow.ufrfunds.has(year) ? thisrow.ufrfunds.get(year) : 0);
    thisrow.totalfunds.set(year, thisrow.totalfunds.get(year) - oldvalue);
    this.rows.get(appr + blin).ufrfunds.set(year, thisvalue);
    thisrow.totalfunds.set(year, thisrow.totalfunds.get(year) + thisvalue);

    // finally, we need to update our actual funding lines...
    // BUT: we don't know if we have a funding line for this APPR+BLIN in this UFR
    var found = false;
    this.current.fundingLines.forEach(fl => { 
      if (appr === fl.appropriation && blin === fl.blin) {
        fl.funds[year] = thisvalue;
        found = true;
      }
    });
    if (!found) {
      console.debug('no matching FL found...adding new one');
      var funds = {};
      funds[year] = thisvalue;

      this.current.fundingLines.push({
        appropriation: appr,
        blin: blin,
        fy: my.pom.fy,
        funds: funds,
        variants: []
      });
    }
  }

}

interface tabledata {
  appropriation: string,
  blin: string,
  modelfunds?: Map<number, number>,
  ufrfunds?: Map<number, number>,
  totalfunds?: Map<number, number>
}