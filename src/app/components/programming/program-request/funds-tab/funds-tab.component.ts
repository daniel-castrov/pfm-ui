import { PB } from './../../../../generated/model/pB';
import { ProgramViewComponent } from './../../../programs/program-view/program-view.component';
import { Component, Input, ApplicationRef, OnChanges, ViewChild } from '@angular/core'
import { forkJoin } from "rxjs/observable/forkJoin"
import { Program, FundingLine, IntMap, UFR, POMService, Pom, PRService, PBService, ProgrammaticRequest, Tag, ProgramsService } from '../../../../generated'
import { Row } from './Row';
import { HeaderComponent } from '../../../header/header.component';

@Component({
  selector: 'funds-tab',
  templateUrl: './funds-tab.component.html',
  styleUrls: ['./funds-tab.component.scss']
})
export class FundsTabComponent implements OnChanges {
  @ViewChild(HeaderComponent) header: HeaderComponent;
  @Input() pr: ProgrammaticRequest;
  private fy: number = new Date().getFullYear() + 2;
  // key is appropriation+blin
  private rows: Map<string, Row> = new Map<string, Row>();
  
  // for the add FL section
  private appropriations: string[] = [];
  private blins: string[] = [];
  private agencies: string[] = [];
  private flfunds = {};
  private appr: string;
  private blin: string;
  private agency: string;
  private item: string;

  constructor(private pbService: PBService,
              private prService: PRService,
              private programsService: ProgramsService) {}
  
  ngOnChanges() {
    if(!this.pr.phaseId) return; // the parent has not completed it's ngOnInit()

    this.loadDropdownOptions();
    this.setPOMtoRows();
    this.setPBtoRows();
  }

  private async setPBtoRows() {

    const pb: PB = (await this.pbService.getByCommunityAndYear(this.header.authUser.currentCommunity, this.fy-2).toPromise()).result;

    const pr: ProgrammaticRequest = (await this.prService.getByPhase(pb.id).toPromise()).result;

    pr.fundingLines.forEach(fund => {
      var key = fund.appropriation + fund.blin;
      var newdata = false;
      if (!this.rows.has(key)) {
        this.rows.set(key, {
          appropriation: fund.appropriation,
          blin: fund.blin,
          pbFunds: new Map<number, number>(),
          prFunds: new Map<number, number>(),
          totalFunds: new Map<number, number>()
        });
        newdata = true;
      }
      var thisrow: Row = this.rows.get(key);
      Object.keys(fund.funds).forEach(function (yearstr) {
        var year: number = Number.parseInt(yearstr);
        var amt: number = fund.funds[yearstr];
        thisrow.pbFunds.set(year, amt);
        if (!thisrow.prFunds.has(year)) {
          thisrow.prFunds.set(year, 0);
        }
        thisrow.totalFunds.set(year, thisrow.prFunds.get(year) + amt);
      });
    });
  }

  private setPOMtoRows() {
    this.pr.fundingLines.forEach(fund => {
      var key = fund.appropriation + fund.blin;
      var prFunds: Map<number, number> = new Map<number, number>();
      var totalFunds: Map<number, number> = new Map<number, number>();
      var pbFunds: Map<number, number> = new Map<number, number>();
      Object.keys(fund.funds).forEach(function (yearstr) {
        var year: number = Number.parseInt(yearstr);
        prFunds.set(year, fund.funds[yearstr]);
        totalFunds.set(year, fund.funds[yearstr]);
        pbFunds.set(year, 0);
      });
      this.rows.set(key, {
        blin: fund.blin,
        appropriation: fund.appropriation,
        prFunds: prFunds,
        totalFunds: totalFunds,
        pbFunds: pbFunds
      });
    });
  }

  private loadDropdownOptions() {
    forkJoin([
      this.programsService.getSearchAgencies(),
      this.programsService.getSearchAppropriations(),
      this.programsService.getSearchBlins()
    ]).subscribe(data2 => {
      this.agencies = data2[0].result.sort();
      this.agency = this.agencies[0];
      this.appropriations = data2[1].result.sort();
      this.appr = this.appropriations[0];
      this.blins = data2[2].result.sort();
      this.blin = this.getBlins()[0];
    });
  }

  newfledit(newval, year) {
    this.flfunds[year] = Number.parseInt( newval );
  }

  addfl() {
    var my: FundsTabComponent = this;
    var key: string = this.appr + this.blin;
    if (this.rows.has(key)) {
      var tabledata = this.rows.get(this.appr + this.blin);
      var ufunds = tabledata.prFunds;
      Object.keys(this.flfunds).forEach(yearstr => {
        var year: number = Number.parseInt(yearstr);
        var oldval: number = (ufunds.has(year) ? ufunds.get(year) : 0);
        ufunds.set(year, oldval + my.flfunds[year]);
      });
    }
    else {
      var tfunds: Map<number, number> = new Map<number, number>();
      var ufunds: Map<number, number> = new Map<number, number>();
      Object.keys(this.flfunds).forEach(yearstr => {
        var year: number = Number.parseInt(yearstr);
        tfunds.set(year, my.flfunds[year]);
        ufunds.set(year, my.flfunds[year]);
      });

      this.rows.set(key, {
        appropriation: my.appr,
        blin: my.blin,
        prFunds: ufunds,
        totalFunds: tfunds,
        pbFunds: new Map<number, number>()
      });

      // now set this same data in the current data (for saves)
      var fl: FundingLine = {
        appropriation: my.appr,
        blin: my.blin,
        fy: this.fy,
        opAgency: my.agency,
        funds: my.flfunds,
        variants: []
      };
      this.pr.fundingLines.push(fl);
    }
  }


  onedit(newval, appr, blin, year) {
    var my: FundsTabComponent = this;
    var thisyear:number = Number.parseInt(year);
    
    var thisvalue = Number.parseInt(newval.replace(/[^0-9]/g, ''));
    if (''===newval || Number.isNaN(thisvalue)) {
      thisvalue = 0;
    }

    var thisrow = this.rows.get(appr + blin);

    var oldvalue: number = (thisrow.prFunds.has(year) ? thisrow.prFunds.get(year) : 0);
    var oldtotal: number = (thisrow.totalFunds.has(year) ? thisrow.totalFunds.get(year) : 0);
    var newamt = oldtotal - oldvalue + thisvalue;
    thisrow.prFunds.set(year, thisvalue);
    thisrow.totalFunds.set(year, newamt);

    // finally, we need to update our actual funding lines...
    // BUT: we don't know if we have a funding line for this APPR+BLIN in this UFR
    var found = false;
    this.pr.fundingLines.forEach(fl => { 
      if (appr === fl.appropriation && blin === fl.blin) {
        fl.funds[year] = thisvalue;
        found = true;
      }
    });
    if (!found) {
      console.debug('no matching FL found...adding new one');
      var funds = {};
      funds[year] = thisvalue;

      this.pr.fundingLines.push({
        appropriation: appr,
        blin: blin,
        fy: this.fy,
        funds: funds,
        item: my.item,
        variants: []
      });
    }
  }

  getBlins(): string[]{
    var ret: string[] = [];
    if ('PROC' === this.appr) {
      this.blins.filter(s => (s.match(/00/))).forEach(str => { ret.push(str) });
    }
    else if ('RDTE' === this.appr) {
      this.blins.filter(s => (s.match(/BA[1-4]/))).forEach(str => { ret.push(str) });
    }
    else if ('O&M' === this.appr) {
      this.blins.filter(s => (s.match(/BA[5-7]/))).forEach(str => { ret.push(str) });
    }
      
    return ret;
  }



  totals(year: number, mode: string) {
    var sum: number = 0;
    this.rows.forEach(data => {
      if ('POM' === mode) {
        sum += (data.pbFunds.has(year) ? data.pbFunds.get(year) : 0);
      }
      else if ('UFR' === mode) {
        sum += (data.prFunds.has(year) ? data.prFunds.get(year) : 0 );
      }
      else if ('TOTAL' === mode) {
        sum += (data.totalFunds.get(year) ? data.totalFunds.get(year) : 0);
      }
    });

    return sum;
  }

}

