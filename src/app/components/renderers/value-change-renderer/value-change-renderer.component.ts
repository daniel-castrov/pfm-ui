import {Component} from '@angular/core';
import { ICellRendererAngularComp } from 'ag-grid-angular';
import {FormatterUtil} from "../../../utils/formatterUtil";

@Component({
  selector: 'value-change-renderer',
  templateUrl: './value-change-renderer.component.html',
  styleUrls: ['./value-change-renderer.component.scss']
})

export class ValueChangeRenderer implements ICellRendererAngularComp {
  params;
  previousValueFormatted;
  previousValue
  newValueFormatted;
  newValue
  constructor() {
  }

  agInit(param) {
    this.params = param;
    this.previousValueFormatted = param.data.previousValueFormatted? param.data.previousFundingLine.funds[param.colDef.colId]: 0;
    this.previousValue = param.data.previousFundingLine? param.data.previousFundingLine.funds[param.colDef.colId] : 0;
    this.newValueFormatted= FormatterUtil.currencyFormatter(param.data.newFundingLine.funds[param.colDef.colId]);
    this.newValue = param.data.newFundingLine.funds[param.colDef.colId];
  }

  refresh(): boolean {
    return false;
  }
}
