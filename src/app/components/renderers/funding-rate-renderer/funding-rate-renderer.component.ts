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
  value;
  constructor() {
  }

  agInit(param) {
    let data: UiProgramRequest = param.data
    if(data.fundsRates && data.fundsRates.hasOwnProperty(param.year))
      this.rate = data.fundsRates[param.year] || 'EQUAL';
    else
      this.rate = 'EQUAL'
    this.value = this.currencyFormatter(param.value);
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
