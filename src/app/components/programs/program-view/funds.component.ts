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
  private startyear:number = 2013;

  constructor() { }

  ngOnInit() {
  }

  @Input()
  set current(curr: Program) {
    var my: FundsComponent = this;
    this._current = curr;

    // sort funding lines based on: appropriation, blin, cycle (don't know what cycle is)
    curr.funding.sort(function (a: FundingLine, b: FundingLine) { 
      var diff = a.appropriation.localeCompare(b.appropriation);
      if ( 0 === diff ) {
        diff = a.blin.localeCompare(b.blin);
      }
      return diff;
    });

    // figure out our rowspans for each blin
    var blockmap: Map<string, AppropriationBlock> = new Map<string, AppropriationBlock>();
    curr.funding.forEach(function (x: FundingLine) {
      var key = x.appropriation + '-' + x.blin;
      if (!blockmap.has(key)) {
        blockmap.set(key, {
          appropriation: x.appropriation,
          blinfunds: new Map<string, CycleFund>(),
          subtotals: new Map<number, number>(),
          rowspan: 1
        });
      }

      var map: Map<number, number> = new Map<number, number>();
      for (var k in x.funds) {
        map.set(Number(k), x.funds[k]);
      }
      blockmap.get(key).cyclefunds.set(x.fy, map);
    });

    this.appropriations = [];
    var it = blockmap.values();
    for (var x = 0; x < blockmap.size; x++ ){
      this.appropriations.push(it.next().value);
    }
    console.log(this.appropriations);

    this.appropriations.forEach(function (x) { 
      console.log(x.appropriation + ' - ' + x.blin + ' - ' + x.cyclefunds.size);
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

interface AppropriationBlock {
  appropriation: string,
  blinfunds: Map<string, CycleFund>,
  subtotals: Map<number, number>,
  rowspan:number
}
