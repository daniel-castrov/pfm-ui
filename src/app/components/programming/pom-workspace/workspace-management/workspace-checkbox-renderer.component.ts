import {Component} from '@angular/core';
import {ICellRendererAngularComp} from 'ag-grid-angular';
import {ICellRendererParams} from "ag-grid-community/dist/lib/rendering/cellRenderers/iCellRenderer";
import { WorkspaceStateService } from './workspace-state.service';

@Component({
  template: `<input type="checkbox"
                    (click)="checkboxClicked($event)"
                    [checked]="stateService.selectedRowIndex == params.rowIndex"
                    [disabled]="!!stateService.operation || params.value.locked"/>`
})
export class WorkspaceCheckboxRendererComponent implements ICellRendererAngularComp {
  params: ICellRendererParams;

  constructor( public stateService: WorkspaceStateService ){}

  agInit(param: ICellRendererParams) {
    this.params = param;
  }

  refresh(): boolean {
    return true;
  }

  checkboxClicked() {
    if(this.stateService.selectedRowIndex == this.params.rowIndex) {
      this.stateService.selectedRowIndex = NaN;
    } else {
      this.stateService.selectedRowIndex = this.params.rowIndex;
    }
  }
}
