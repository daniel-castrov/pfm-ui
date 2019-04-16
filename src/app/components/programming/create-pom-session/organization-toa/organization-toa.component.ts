import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { OneYearToaData } from '../create-pom-session.component';

@Component({
  selector: 'app-organization-toa',
  templateUrl: './organization-toa.component.html',
  styleUrls: ['./organization-toa.component.scss']
})
export class OrganizationToaComponent implements OnInit {
  @Input() private toainfo: OneYearToaData;
  @Input() private orgmap: Map<string, string>;
  @Output() valuesChange: EventEmitter<OneYearToaData> = new EventEmitter<OneYearToaData>();

  limits: OrgLimits[] = [];

  constructor() { }

  @Input() get available(): number{
    return this.toainfo.community.amount - this.limits.map(v => v.currval).reduce((prev, cur) => prev + cur, 0);
  }

  @Input() get lockable(): boolean {
    // we cannot allow all the sliders to be locked because
    // we need somewhere to give/take changes
    // so make sure we have at least two unlocked sliders at all times
    return (this.limits.filter(lim => !lim.locked).length > 2);
  }

  ngOnInit() {
    var newlims: OrgLimits[] = [];
    this.toainfo.orgs.forEach((amt, orgid) => { 
      newlims.push({
        orgid: orgid,
        orgname: this.orgmap.get(orgid),
        currval: amt.amount,
        maxval: this.toainfo.community.amount,
        locked: false
      });
    });
    this.limits = newlims;
    this.recalculateLimits();
  }

  recalculateLimits(changer?: OrgLimits) {
    var avail = this.available;
    console.log(avail + ' money is available');
    console.log(this.limits);
    // every organization *could* increase its TOA by the available amount
    //this.limits.forEach(lim => (lim.maxval = lim.currval + avail));

    // actually reallocate money to the unlocked orgs
    // (if we're recalculating because we changed a limit, pretend that's locked, too)
    var unlocked: OrgLimits[] = this.limits
      .filter(lim => changer ? lim.orgid != changer.orgid : true)
      .filter(lim => !lim.locked);

    // figure out percentages and allocate
    var totalmoney: number = unlocked.map(v => v.currval).reduce((prev, cur) => prev + cur, 0);
    
    unlocked.forEach(lim => {
      var pct: number = (0 === totalmoney
        ? 1 / unlocked.length // if everybody's 0, allocate evenly
        : lim.currval / totalmoney);
      var change = Math.round(pct * avail);
      console.log('adding ' + Math.round(pct * 100) + '% (' + change + ') to ' + lim.orgname + '; ' + lim.currval + '=>' + (lim.currval + change));
      lim.currval += change;
    });

    // if we have locked values, then our maxvals must be reduced
    // so that we cannot allocate already-locked money
    this.limits.forEach(lim => {
      var lockedmoney: number = this.limits
        .filter(l => l !== lim)
        .filter(l => l.locked)
        .map(l => l.currval).reduce((p, c) => p + c, 0);
      lim.maxval = this.toainfo.community.amount - lockedmoney;
    });

    this.limits.forEach(lim => {
      this.toainfo.orgs.get(lim.orgid).amount = lim.currval;
    });

    // tell the world we have some new values
    console.log(this.toainfo);
    this.valuesChange.emit(this.toainfo);
  }

  toggleLock(lim: OrgLimits) {
    lim.locked = !lim.locked;
    this.recalculateLimits(lim);
  }
}

interface OrgLimits {
  orgid: string,
  orgname: string,
  currval: number,
  maxval: number,
  locked: boolean
}