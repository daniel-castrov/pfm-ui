import { Component } from '@angular/core';

import { IHeaderGroupAngularComp } from 'ag-grid-angular'

@Component({
  selector: 'app-fy-header',
  templateUrl: './fy-header.component.html',
  styleUrls: ['./fy-header.component.scss']
})
export class FyHeaderComponent implements IHeaderGroupAngularComp {
  private firstMonth: number;
  private maxMonths: number;
  private nextfx;
  private prevfx;
  private fy: number;
  private nextOk: boolean;
  private prevOk: boolean;
  private prefix: string = '';

  constructor() {
  }

  agInit(params) {
    this.firstMonth = params.firstMonth;
    this.maxMonths = params.maxMonths;
    var inty: number = Number.parseInt((this.firstMonth / 12).toFixed(0));
    this.fy = ( params.fy + inty );
    this.nextfx = params.next;
    this.prevfx = params.prev;
    if (params.prefix) {
      this.prefix = params.prefix;
    }
    this.resetOks();
  }

  resetOks() {
    this.prevOk = (this.firstMonth - 12 >= 0);
    this.nextOk = (this.firstMonth + 12 < this.maxMonths);
  }

  prev() {
    if (this.prevOk) {
      this.prevfx();
      this.firstMonth -= 12;
      this.fy -= 1;
      this.resetOks();
    }
  }

  next() {
    if (this.nextOk) {
      this.nextfx();
      this.firstMonth += 12;
      this.fy += 1;
      this.resetOks();
    }
  }
}
