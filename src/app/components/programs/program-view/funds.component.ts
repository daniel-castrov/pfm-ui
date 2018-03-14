import { Component, OnInit, Input } from '@angular/core';
import { Program, FundingLine } from '../../../generated';

@Component({
  selector: 'funds',
  templateUrl: './funds.component.html',
  styleUrls: ['./funds.component.css']
})
export class FundsComponent implements OnInit {
  private _current: Program;
  private appropriations: FundingLine[] = [];
  private spans: Map<string, number> = new Map<string, number>();
  private startyear:number = 2010;

  constructor() { }

  ngOnInit() {
  }

  @Input()
  set current(curr: Program) {
    var my: FundsComponent = this;
    this._current = curr;
    this.appropriations = curr.funding;

    // sort funding lines based on: appropriation, blin, cycle (don't know what cycle is)
    this.appropriations.sort(function (a: FundingLine, b: FundingLine) { 
      var diff = a.appropriation.localeCompare(b.appropriation);
      if ( 0 === diff ) {
        diff = a.blin.localeCompare(b.blin);
      }
      return diff;
    });

    // figure out our rowspans for each blin
    this.spans.clear();
    this.appropriations.forEach(function (x: FundingLine) {
      var key = x.appropriation + '-' + x.blin;
      if (!my.spans.has(key)) {
        my.spans.set(key, 0);
      }
      my.spans.set(key, my.spans.get(key));
    });
  }
  get current() {
    return this._current;
  }
}
