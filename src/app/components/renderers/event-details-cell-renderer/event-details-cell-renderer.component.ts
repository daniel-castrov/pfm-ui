import { Component } from '@angular/core';
import { AgRendererComponent, ICellRendererAngularComp } from 'ag-grid-angular';

@Component({
  selector: 'app-event-details-cell-renderer',
  templateUrl: './event-details-cell-renderer.component.html',
  styleUrls: ['./event-details-cell-renderer.component.scss']
})

export class EventDetailsCellRendererComponent implements ICellRendererAngularComp {
  private params;

  constructor() {
  }

  agInit(param) {
    this.params = param;
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
}
