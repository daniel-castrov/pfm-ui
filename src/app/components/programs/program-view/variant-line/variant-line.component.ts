import { Component, OnInit, Input } from '@angular/core';
import { VariantLine } from '../variant-line';

@Component({
  selector: 'variant-line',
  templateUrl: './variant-line.component.html',
  styleUrls: ['../variants.component.css']
})
export class VariantLineComponent implements OnInit {
  @Input() startyear: number;
  private _variants: VariantLine[];
  private totals: Map<number, number> = new Map<number, number>();
  private total: number = 0;
  private name: string;
  private id: string;

  constructor() { }

  ngOnInit() {
  }

  @Input() set variants(vv: VariantLine[]) {
    this._variants = vv;
    var my: VariantLineComponent = this;
    my.totals.clear();
    my.total = 0;
    vv.forEach(function (x:VariantLine) { 
      my.name = x.name;
      my.id = x.id;

      x.quantities.forEach(function (val, key) { 
        if (!my.totals.has(key)) {
          my.totals.set(key, 0);
        }
        my.totals.set(key, my.totals.get(key) + val);
        my.total += val;
      });
    });
  }

  get variants(): VariantLine[] {
    return this._variants;
  }
}
