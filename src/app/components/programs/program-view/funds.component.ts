import { Component, OnInit, Input } from '@angular/core';
import { Program, FundingLine, IntMap } from '../../../generated';

@Component({
  selector: 'funds',
  templateUrl: './funds.component.html',
  styleUrls: ['./funds.component.css']
})
export class FundsComponent implements OnInit {
  private _current: Program;
  private appropriations: AppropriationBlock[] = [];
  @Input() startyear: number;
  private totals: Map<number, number> = new Map<number, number>();

  constructor() { }

  ngOnInit() {
  }

  @Input()
  set current(curr: Program) {
    if (!curr) {
      return;
    }
    var my: FundsComponent = this;
    this._current = curr;

    // sort funding lines based on: appropriation, blin, cycle
    curr.funding.sort(function (a: FundingLine, b: FundingLine) {
      var diff = a.appropriation.localeCompare(b.appropriation);
      if ( 0 === diff ) {
        diff = a.blin.localeCompare(b.blin);
        if (0 == diff) {
          diff = a.fy - b.fy;
        }
      }
      return diff;
    });

    // figure out our rowspans for each blin
    var blockmap: Map<string, AppropriationBlock> = new Map<string, AppropriationBlock>();
    var blinmap: Map<string, BlinBlock> = new Map<string, BlinBlock>();
    curr.funding.forEach(function (x: FundingLine) {
      var blinmapkey = x.appropriation + '-' + x.blin;

      var appblock:AppropriationBlock = null;
      if (!blockmap.has(x.appropriation)) {
        appblock = {
          appropriation: x.appropriation,
          blins: [],
          subtotals: new Map<number, number>(),
          rowspan: 0
        };
        blockmap.set(x.appropriation, appblock);
      }

      appblock = blockmap.get(x.appropriation);
      var blinblock: BlinBlock = null;
      if (!blinmap.has(blinmapkey)) {
        blinblock = {
          blin: x.blin,
          cfunds: [],
          rowspan: 0
        };
        blinmap.set(blinmapkey, blinblock);
        appblock.blins.push(blinblock);
      }

      var map: Map<number, number> = new Map<number, number>();
      for (var k in x.funds) {
        var fkey: number = Number(k);
        map.set(fkey, x.funds[k]);
        if (!appblock.subtotals.has(fkey)){
          appblock.subtotals.set(fkey, 0);
        }
        var oldsub = appblock.subtotals.get(fkey);
        appblock.subtotals.set(fkey, oldsub + x.funds[k]);
      }
      var blinblock: BlinBlock = blinmap.get(blinmapkey);
      appblock.rowspan += 1;
      blinblock.rowspan += 1;
      blinblock.cfunds.push({
        cycle: x.fy,
        funds: map
      });
    });

    this.appropriations = [];
    var it = blockmap.values();
    for (var x = 0; x < blockmap.size; x++ ){
      this.appropriations.push(it.next().value);
    }

    // finally, figure out the total for this request
    // by adding up all the subtotals
    this.totals.clear();
    this.appropriations.forEach(function (x) {
      x.subtotals.forEach(function (val, key) {
        if (!my.totals.has(key)) {
          my.totals.set(key, 0);
        }
        my.totals.set(key, my.totals.get(key) + val);
      });
    });

  }
  get current() {
    return this._current;
  }
}

interface CycleFund {
  cycle: number,
  funds: Map<number, number>
}

interface BlinBlock {
  blin: string,
  cfunds: CycleFund[],
  rowspan: 0
}

interface AppropriationBlock {
  appropriation: string,
  blins: BlinBlock[],
  subtotals: Map<number, number>,
  rowspan: number
}
