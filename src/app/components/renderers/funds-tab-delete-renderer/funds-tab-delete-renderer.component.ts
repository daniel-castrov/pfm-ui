import {Component} from '@angular/core';
import { ICellRendererAngularComp } from 'ag-grid-angular';

@Component({
  selector: 'funds-tab-delete-renderer',
  templateUrl: './funds-tab-delete-renderer.component.html',
  styleUrls: ['./funds-tab-delete-renderer.component.scss']
})
export class FundsTabDeleteRenderer implements ICellRendererAngularComp {
  params;

  constructor() {
  }

  agInit(param) {
    this.params = param;
  }

  deleteFundingLine() {
    this.params.context.parentComponent.deleteFundingLine(this.params.rowIndex);
  }

  refresh(): boolean {
    return false;
  }
}
