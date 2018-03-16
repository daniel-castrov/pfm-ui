import { Component, OnInit, Input } from '@angular/core';
import { CurrencyPipe } from '@angular/common';
import { Program, FundingLine, Variant } from '../../../generated';
import { VariantLineComponent } from './variant-line/variant-line.component';
import { VariantLine } from './variant-line';

@Component({
  selector: 'variants',
  templateUrl: './variants.component.html',
  styleUrls: ['./variants.component.css']
})
export class VariantsComponent implements OnInit {
  @Input() startyear: number;
  private _current: Program;
  private varmap: Map<string, VariantLine[]> = new Map<string, VariantLine[]>();
  private varkeys: string[] = [];
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
    my.varmap.clear();
    curr.funding.forEach(function (fl: FundingLine) { 
      fl.variants.forEach(function (variant: Variant) {
        if (!my.varmap.has(variant.shortName)) {
          my.varmap.set(variant.shortName, []);
        }

        var sum = 0;
        var map: Map<number, number> = new Map<number, number>();
        for (var k in variant.quantity) {
          var year: number = Number(k);
          var amt = variant.quantity[k];
          map.set(year, amt);
          sum += amt;

          my.total += amt;
          if (!my.totals.has(year)) {
            my.totals.set(year, 0);
          }
          my.totals.set(year, my.totals.get(year) + amt);
        }

        var vl: VariantLine = {
          cycle: fl.fy,
          name: variant.longName,
          id: variant.shortName,
          description: variant.description,
          branch: variant.branch,
          contractor: variant.contractor,
          unitcost: variant.unitCost,
          quantities: map,
          total: sum
        };
        my.varmap.get( variant.shortName ).push(vl);
      });
    });

    my.varkeys = Array.from(my.varmap.keys());
  }

  get current(): Program {
    return this._current;
  }
}
