import {Component, ViewEncapsulation} from '@angular/core';
import { ICellRendererAngularComp } from 'ag-grid-angular';
import {PhaseType} from "../../programming/select-program-request/UiProgramRequest";

@Component({
  selector: 'summary-program-cell-renderer',
  templateUrl: './summary-program-cell-renderer.component.html',
  styleUrls: ['./summary-program-cell-renderer.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class SummaryProgramCellRenderer implements ICellRendererAngularComp {
  params;
  PhaseType = PhaseType;

  constructor() {
  }

  agInit(param) {
    this.params = param;
  }

  public editPR() {
    this.params.context.componentParent.editPR(this.params.data.id);
  }

  saveDeletionValues() {
    this.params.context.componentParent.saveDeletionValues(this.params.data.id, this.params.data.shortName);
  }

  refresh(): boolean {
    return false;
  }
}
