import { Component, OnInit, Input } from '@angular/core';
import { CurrencyPipe } from '@angular/common';
import { Program, FundingLine, Variant } from '../../../generated';

@Component({
  selector: 'variants',
  templateUrl: './variants.component.html',
  styleUrls: ['./variants.component.css']
})
export class VariantsComponent implements OnInit {
  @Input() startyear: number;
  private _current: Program;
  private variants: VariantLine[] = [];
  private totals: Map<number, number> = new Map<number, number>();
  private total: number = 0;
  constructor() { }

  ngOnInit() {
  }

  @Input() set current(curr: Program) {
    if (!curr) {
      return;
    }

    var my: VariantsComponent = this;
    my.totals.clear();
    curr.funding.forEach(function (fl: FundingLine) { 
      fl.variants.forEach(function (y: Variant) {
        var sum = 0;
        var map: Map<number, number> = new Map<number, number>();
        for (var k in fl.funds) {
          var fkey: number = Number(k);
          var linesum:number = y.unitCost * y.quantity;
          map.set(fkey, linesum);
          sum += linesum;

          my.total += linesum;
          if (!my.totals.has(fkey)) {
            my.totals.set(fkey, 0);
          }
          my.totals.set(fkey, my.totals.get(fkey) + linesum);
        }

        my.variants.push({
          cycle: fl.fy,
          name: y.name,
          description: y.description,
          branch: y.branch,
          contractor: y.contractor,
          quantity: y.quantity,
          unitcost: y.unitCost,
          funds: map,
          total:sum
        });
      });
    });
  }

  get current(): Program {
    return this._current;
  }
}

interface VariantLine {
  cycle: number,
  name: string,
  description: string,
  branch: string,
  contractor: string,
  quantity: number,
  unitcost: number,
  funds: Map<number, number>,
  total: number
}

