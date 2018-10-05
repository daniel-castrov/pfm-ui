import {Component} from '@angular/core';
import {ICellRendererAngularComp} from 'ag-grid-angular';
import {ICellRendererParams} from "ag-grid/dist/lib/rendering/cellRenderers/iCellRenderer";
import {SelectedRow} from "./selected-row";

@Component({
  template: `<input type="checkbox" 
                    (click)="checkboxClicked($event)" 
                    [checked]="selectedRow == params.rowIndex" />`
})
export class CheckboxRendererComponent implements ICellRendererAngularComp {
  private params: ICellRendererParams;


  agInit(param: ICellRendererParams) {
    this.params = param;
  }

  refresh(): boolean {
    return true;
  }

  get selectedRow(): number {
    return SelectedRow.index;
  }

  checkboxClicked() {
    if(SelectedRow.index == this.params.rowIndex) {
      SelectedRow.index = NaN;
    } else {
      SelectedRow.index = this.params.rowIndex;
    }
    console.log(this.selectedRow)
  }
}
