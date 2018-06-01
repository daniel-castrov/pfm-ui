import { Component, OnInit, Input } from '@angular/core';
import { Program, FundingLine, IntMap, UFR, POMService, Pom, Variant, ProgramsService, PRService, ProgrammaticRequest } from '../../../generated';

@Component({
  selector: 'ufr-variants',
  templateUrl: './ufr-variants.component.html',
  styleUrls: ['./ufr-variants.component.scss']
})
export class UfrVariantsComponent implements OnInit {
  @Input() current: UFR;
  private pom: Pom;
  private fy: number = new Date().getFullYear() + 2;
  private model: ProgrammaticRequest;
  private newblin: string = '';
  private blinsleft: Set<string> = new Set<string>();
  private uvals: Map<number, number> = new Map<number, number>();
  private cvals: Map<number, number> = new Map<number, number>();
  private diffs: {} = {};

  constructor(private pomsvc: POMService, private prsvc :PRService) { }

  ngOnInit() {
    var my: UfrVariantsComponent = this;
    
    my.blinsleft.clear();
    this.pomsvc.getById(this.current.pomId).subscribe(data => {
      my.pom = data.result;
      my.fy = my.pom.fy;

      // we want a list of tables we can create, so get PROC blins 
      // that don't already have variants
      my.current.fundingLines.filter(fl => ('PROC' === fl.appropriation && 0 === fl.variants.length)).forEach(fl => {
        my.blinsleft.add(fl.blin);
        if (1 === my.blinsleft.size) {
          my.newblin = fl.blin;
        }
      });

      if (my.current.shortName) {
        my.prsvc.getByPhaseAndShortName(my.pom.id, my.current.shortName).subscribe(model => {
          // get the current values for this program
          my.model = model.result;
          //console.log(my.model);
        });
      }

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

  newtable() {
    if ('' === this.newblin) {
      return;
    }

    var my: UfrVariantsComponent = this;
    
    // find the funding line with this blin, and add a new variant
    this.current.fundingLines.forEach(fl => { 
      if (fl.blin === my.newblin) {
        if (0 === fl.variants.length) {
          // add a new variant
          var qtys: IntMap = {};
          for (var i = 0; i < 5; i++){
            qtys[my.pom.fy + i] = 1;
          }

          var variant: Variant = {
            quantity: qtys,
            branch: 'USA',
            unitCost: 1.0
          };
          fl.variants.push(variant);
          my.blinsleft.delete(my.newblin);          
        }
        else {
          // nothing to do...we already have a table for this variant
        }
      }
    });

    if (1 == my.blinsleft.size) {
      my.newblin = my.blinsleft.entries().next().value[0];
    }
  }

  newbranchline(fl) {
    var qtys: IntMap = {};
    for (var i = 0; i < 5; i++) {
      qtys[this.pom.fy + i] = 1;
    }

    var variant: Variant = {
      quantity: qtys,
      branch: 'USA',
      unitCost: 1.0
    };
    fl.variants.push(variant);
  }

  newedit(newvalstr, variant, fy) {
    var qty = Number.parseInt(newvalstr);
    variant.quantity[fy] = qty;

    console.log(this.current);
  }
}

