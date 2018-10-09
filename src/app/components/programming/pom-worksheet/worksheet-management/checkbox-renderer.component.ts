import {Component} from '@angular/core';
import {ICellRendererAngularComp} from 'ag-grid-angular';
import {ICellRendererParams} from "ag-grid/dist/lib/rendering/cellRenderers/iCellRenderer";
import {StateService} from "./state.service";

@Component({
  template: `<input type="checkbox"
                    (click)="checkboxClicked($event)"
                    [checked]="selectedRowIndex == params.rowIndex"
                    [disabled]="!!operation"/>`
})
export class CheckboxRendererComponent extends StateService implements ICellRendererAngularComp {
  params: ICellRendererParams;

  agInit(param: ICellRendererParams) {
    this.params = param;
  }

  refresh(): boolean {
    return true;
  }

  checkboxClicked() {
    if(this.selectedRowIndex == this.params.rowIndex) {
      this.selectedRowIndex = NaN;
    } else {
      this.selectedRowIndex = this.params.rowIndex;
    }
  }
}
