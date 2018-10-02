import { Component } from '@angular/core';
import { AgRendererComponent, ICellRendererAngularComp } from 'ag-grid-angular';

@Component({
  selector: 'app-program-cell-renderer',
  templateUrl: './program-cell-renderer.component.html',
  styleUrls: ['./program-cell-renderer.component.scss']
})
export class ProgramCellRendererComponent implements ICellRendererAngularComp {
  private params;

  constructor() {
  }

  agInit(param) {
    this.params = param;
  }

  fullname(): string {
    if (this.params.context.programlkp) {
      return (this.params.context.programlkp.has(this.params.data.mrId)
        ? this.params.context.programlkp.get(this.params.data.mrId)
        : this.params.data.mrId);
    }
    else {
      return this.params.value;
    }
  }

  id(): string {
    return this.params.data.id;
  }

  route(): string {
    return this.params.context.route;
  }

  refresh(): boolean {
    return true;
  }

  makelink(): boolean {
    if (this.params.context.enabled) {
      return (typeof this.params.context.enabled === 'function'
        ? this.params.context.enabled(this.params)
        : this.params.context.enabled);
    }

    return false;
  }
}
