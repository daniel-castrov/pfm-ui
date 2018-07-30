import { Component } from '@angular/core';
import { ICellRendererAngularComp } from 'ag-grid-angular';

@Component({
  selector: 'summary-program-cell-renderer',
  templateUrl: './summary-program-cell-renderer.component.html',
  styleUrls: ['./summary-program-cell-renderer.component.scss']

})
export class SummaryProgramCellRenderer implements ICellRendererAngularComp {
  params;

  constructor() {
  }

  agInit(param) {
    this.params = param;
  }

  public editPR() {
    this.params.context.componentParent.editPR(this.params.rowIndex);
  }

  saveDeletionValues() {
    this.params.context.componentParent.saveDeletionValues(this.params.data.id, this.params.data.shortName);
  }

  refresh(): boolean {
    return false;
  }
}
