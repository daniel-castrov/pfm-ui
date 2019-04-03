import {Component} from '@angular/core';
import { ICellRendererAngularComp } from 'ag-grid-angular';
import { UiProgramRequest } from '../../programming/select-program-request/UiProgramRequest';

@Component({
  selector: 'funding-rate-renderer',
  templateUrl: './funding-rate-renderer.component.html',
  styleUrls: ['./funding-rate-renderer.component.scss']
})
export class FundingRateRenderer implements ICellRendererAngularComp {
  rate;
  rateAmount;
  value;
  constructor() {
  }

  agInit(param) {
    let data: UiProgramRequest = param.data
    var lastpb: number = (data.totalFundsPB && data.totalFundsPB.hasOwnProperty(param.year)
      ? data.totalFundsPB[param.year]
      : 0);
    if (param.value > lastpb) {
      this.rate = 'MORE'
    } else if (param.value < lastpb) {
      this.rate = 'LESS'
    } else {
      this.rate = 'EQUAL'
    }

    this.value = this.currencyFormatter(param.value);

    this.rateAmount = 'PB' + (param.fy - 1).toString().replace('20', '') + ': '
      + (lastpb > 0 ? this.currencyFormatter(lastpb) : 'not funded');
  }

  refresh(): boolean {
    return false;
  }

  currencyFormatter(value) {
    var usdFormat = new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    });
    return usdFormat.format(value);
  }
}
