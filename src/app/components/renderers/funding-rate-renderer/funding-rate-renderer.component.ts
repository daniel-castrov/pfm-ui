import {Component} from '@angular/core';
import { ICellRendererAngularComp } from 'ag-grid-angular';
import { UiProgramRequest } from '../../programming/select-program-request/UiProgramRequest';

@Component({
  selector: 'funding-rate-renderer',
  templateUrl: './funding-rate-renderer.component.html',
  styleUrls: ['./funding-rate-renderer.component.scss']
})
export class FundingRateRenderer implements ICellRendererAngularComp {
  params;
  rate;
  value;
  constructor() {
  }

  agInit(param) {
    this.params = param;
    let data: UiProgramRequest = this.params.data
    if(data.dataPath[0]=='AUTOINJ')  { 
      console.log(data)
      console.log(this.params.value)
    }
    this.rate = this.params.rate;
    this.value = this.currencyFormatter(this.params.value);
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
export enum Rate {
  MORE,
  LESS,
  EQUAL
}
