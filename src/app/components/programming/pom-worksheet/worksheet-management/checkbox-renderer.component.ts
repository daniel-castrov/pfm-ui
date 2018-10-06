import {Component} from '@angular/core';
import {ICellRendererAngularComp} from 'ag-grid-angular';
import {ICellRendererParams} from "ag-grid/dist/lib/rendering/cellRenderers/iCellRenderer";
import {SelectedRowService} from "./selected-row.service";

@Component({
  template: `<input type="checkbox" 
                    (click)="checkboxClicked($event)" 
                    [checked]="selectedRowService.index == params.rowIndex" />`
})
export class CheckboxRendererComponent implements ICellRendererAngularComp {
  private params: ICellRendererParams;
  constructor( private selectedRowService: SelectedRowService ) {}


  agInit(param: ICellRendererParams) {
    this.params = param;
  }

  refresh(): boolean {
    return true;
  }

  checkboxClicked() {
    if(this.selectedRowService.index == this.params.rowIndex) {
      this.selectedRowService.index = NaN;
    } else {
      this.selectedRowService.index = this.params.rowIndex;
    }
  }
}
