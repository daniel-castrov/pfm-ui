import { Component, OnInit, Input } from '@angular/core';
import { Program, FundingLine, IntMap, UFR, POMService, Pom, Variant } from '../../../generated';

@Component({
  selector: 'ufr-variants',
  templateUrl: './ufr-variants.component.html',
  styleUrls: ['./ufr-variants.component.scss']
})
export class UfrVariantsComponent implements OnInit {
  @Input() current: UFR;
  private pom: Pom;
  private fy: number = new Date().getFullYear() + 2;
  private uvals: Map<number, number> = new Map<number, number>();
  private cvals: Map<number, number> = new Map<number, number>();
  private diffs: {} = {};

  constructor(private pomsvc: POMService) { }

  ngOnInit() {
    var my: UfrVariantsComponent = this;
    this.pomsvc.getById(this.current.phaseId).subscribe(data => {
      my.pom = data.result;
      my.fy = my.pom.fy;
      my.sumtotals();
    });
  }

  sum(variant:Variant, startyear, endyear): number {
    var sum: number=0;
    for (var year = startyear; year <= endyear; year++){
      if (variant.quantity[year]) {
        sum += variant.quantity[year];
      }
    }
    return sum;
  }

  sumtotals() {
    
  }
}
