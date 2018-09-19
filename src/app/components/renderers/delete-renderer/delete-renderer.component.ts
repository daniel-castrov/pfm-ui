import {Component} from '@angular/core';
import { ICellRendererAngularComp } from 'ag-grid-angular';

@Component({
  selector: 'delete-renderer',
  templateUrl: './delete-renderer.component.html',
  styleUrls: ['./delete-renderer.component.scss']
})
export class DeleteRenderer implements ICellRendererAngularComp {
  params;
  hidden = true;
  constructor() {
  }

  agInit(param) {
    this.params = param;
    if (typeof this.params.context.deleteHidden !== 'undefined') {
      this.hidden = (typeof this.params.context.deleteHidden === 'function'
        ? this.params.context.deleteHidden( param )
        : this.params.context.deleteHidden
      );
    }
    else {
      if (this.params.data.fundingLine && this.params.data.fundingLine.userCreated) {
        this.hidden = false;
      }
      if (this.params.data.serviceLine && !this.params.data.serviceLine.bulkOrigin && this.params.data.serviceLine.branch !== 'Totals') {
        this.hidden = false;
      }
    }
  }

  delete() {
    this.params.context.parentComponent.delete(this.params.rowIndex, this.params.data);
  }

  refresh(): boolean {
    return false;
  }
}
