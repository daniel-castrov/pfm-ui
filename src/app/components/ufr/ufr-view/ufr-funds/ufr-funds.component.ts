import { TagsService } from '../../../../services/tags.service';
import { Component, OnInit, Input } from '@angular/core'
import {FundingLine, UFR, POMService, Pom, PRService, PBService, ProgrammaticRequest} from '../../../../generated'

@Component({
  selector: 'ufr-funds',
  templateUrl: './ufr-funds.component.html',
  styleUrls: ['./ufr-funds.component.scss']
})
export class UfrFundsComponent implements OnInit {
  @Input() current: UFR;
  @Input() editable: boolean = false;
  private pom: Pom;
  private fy: number = new Date().getFullYear() + 2;
  private uvals: Map<number, number> = new Map<number, number>();
  private cvals: Map<number, number> = new Map<number, number>();
  private diffs: {} = {};
  private model: ProgrammaticRequest;
  // key is appropriation+blin
  private rows: Map<string, tabledata> = new Map<string, tabledata>();
  
  // for the add FL section
  private appropriations: string[] = [];
  private baOrBlins: string[] = [];
  private agencies: string[] = [];
  private flfunds = {};
  private appr: string;
  private baOrBlin: string;
  private opagency: string;
  private item: string;

  constructor(private pomsvc: POMService, 
              private pbService: PBService,
              private prService: PRService,
              private tagsService: TagsService) { }
  
  ngOnInit() {
    var my: UfrFundsComponent = this;

    this.pomsvc.getById(my.current.phaseId).subscribe(async data => {
      my.pom = data.result;
      my.fy = my.pom.fy;

      console.log('into ufr-funds init!' + my.fy );
      
      // get the data from the UFR into our tabledata structure
      my.current.fundingLines.forEach(fund => { 
        var key = fund.appropriation + fund.baOrBlin + fund.item + fund.opAgency;
        var cfunds: Map<number, number> = new Map<number, number>();
        var tfunds: Map<number, number> = new Map<number, number>();
        var mfunds: Map<number, number> = new Map<number, number>();

        Object.keys(fund.funds).forEach(function (yearstr) {
          var year: number = Number.parseInt(yearstr);
          cfunds.set(year, fund.funds[yearstr]);
          tfunds.set(year, fund.funds[yearstr]);
          mfunds.set(year, 0);
        });

        my.rows.set(key, {
          baOrBlin: fund.baOrBlin,
          appropriation: fund.appropriation,
          opagency: fund.opAgency,
          item: fund.item,
          ufrfunds: cfunds,
          totalfunds: tfunds,
          modelfunds: mfunds
        });
      });

      // ...now merge/add the original funding lines from the POM
      // (new programs/subprograms won't necessarily have a shortname yet)
      if (my.current.originalMrId) {
        my.prService.getByPhaseAndMrId(my.pom.id, my.current.originalMrId).subscribe(model => {
          // get the current values for this program
          my.model = model.result;
          //console.log(my.model);
          //console.log('model check?');
          my.model.fundingLines.forEach(fund => {
            var key = fund.appropriation + fund.baOrBlin;

            var newdata = false;
            if (!my.rows.has(key)) {
              my.rows.set(key, {
                appropriation: fund.appropriation,
                baOrBlin: fund.baOrBlin,
                opagency: fund.opAgency,
                item: fund.item,
                modelfunds: new Map<number, number>(),
                ufrfunds: new Map<number, number>(),
                totalfunds: new Map<number, number>()
              });
              newdata = true;
            }
            var thisrow: tabledata = my.rows.get(key);

            Object.keys(fund.funds).forEach(function (yearstr) {
              var year: number = Number.parseInt(yearstr);
              var amt: number = fund.funds[yearstr];
              thisrow.modelfunds.set(year, amt);
              if (!thisrow.ufrfunds.has(year)) {
                thisrow.ufrfunds.set(year, 0);
              }
              thisrow.totalfunds.set(year, thisrow.ufrfunds.get(year) + amt);
            });
          });
        });
      }  

      {
        this.agencies = await this.tagsService.tagAbbreviationsForOpAgency();
        this.opagency = this.agencies[0];
      }
      {
        this.appropriations = await this.tagsService.tagAbbreviationsForAppropriation();
        this.appr = this.appropriations[0];
      }
      {
        this.baOrBlins = await this.tagsService.tagAbbreviationsForBlin();
        this.baOrBlin = this.getBaOrBlins()[0];
      }
    });
  }

  newfledit(newval, year) {
    this.flfunds[year] = Number.parseInt( newval );
  }

  addfl() {
    var my: UfrFundsComponent = this;
    var key: string = this.appr + this.baOrBlin;
    if (this.rows.has(key)) {
      var tabledata = this.rows.get(this.appr + this.baOrBlin);
      var ufunds = tabledata.ufrfunds;
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
        baOrBlin: my.baOrBlin,
        opagency: my.opagency,
        item: my.item,
        ufrfunds: ufunds,
        totalfunds: tfunds,
        modelfunds: new Map<number, number>()
      });

      // now set this same data in the current data (for saves)
      var fl: FundingLine = {
        appropriation: my.appr,
        baOrBlin: my.baOrBlin,
        opAgency: my.opagency,
        funds: my.flfunds,
        variants: []
      };
      this.current.fundingLines.push(fl);
    }
  }


  onedit(newval, appr, baOrBlin, year) {
    var my: UfrFundsComponent = this;
    var thisyear:number = Number.parseInt(year);
    
    var thisvalue = Number.parseInt(newval.replace(/[^0-9]/g, ''));
    if (''===newval || Number.isNaN(thisvalue)) {
      thisvalue = 0;
    }

    var thisrow = this.rows.get(appr + baOrBlin);

    var oldvalue: number = (thisrow.ufrfunds.has(year) ? thisrow.ufrfunds.get(year) : 0);
    var oldtotal: number = (thisrow.totalfunds.has(year) ? thisrow.totalfunds.get(year) : 0);
    var newamt = oldtotal - oldvalue + thisvalue;
    thisrow.ufrfunds.set(year, thisvalue);
    thisrow.totalfunds.set(year, newamt);

    // finally, we need to update our actual funding lines...
    // BUT: we don't know if we have a funding line for this APPR+BLIN in this UFR
    var found = false;
    this.current.fundingLines.forEach(fl => { 
      if (appr === fl.appropriation && baOrBlin === fl.baOrBlin) {
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
        baOrBlin: baOrBlin,
        funds: funds,
        item: my.item,
        variants: []
      });
    }
  }

  getBaOrBlins(): string[]{
    var ret: string[] = [];
    if ('PROC' === this.appr) {
      this.baOrBlins.filter(s => (s.match(/00/))).forEach(str => { ret.push(str) });
    }
    else if ('RDTE' === this.appr) {
      this.baOrBlins.filter(s => (s.match(/BA[1-4]/))).forEach(str => { ret.push(str) });
    }
    else if ('O&M' === this.appr) {
      this.baOrBlins.filter(s => (s.match(/BA[5-7]/))).forEach(str => { ret.push(str) });
    }
      
    return ret;
  }



  totals(year: number, mode: string) {
    var sum: number = 0;
    this.rows.forEach(data => {
      if ('POM' === mode) {
        sum += (data.modelfunds.has(year) ? data.modelfunds.get(year) : 0);
      }
      else if ('UFR' === mode) {
        sum += (data.ufrfunds.has(year) ? data.ufrfunds.get(year) : 0 );
      }
      else if ('TOTAL' === mode) {
        sum += (data.totalfunds.get(year) ? data.totalfunds.get(year) : 0);
      }
    });

    return sum;
  }

}

interface tabledata {
  appropriation: string,
  baOrBlin: string,
  opagency: string,
  item: string,
  modelfunds?: Map<number, number>,
  ufrfunds?: Map<number, number>,
  totalfunds?: Map<number, number>
}