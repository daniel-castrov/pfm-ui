import {Component} from '@angular/core';
import { ICellRendererAngularComp } from 'ag-grid-angular';

@Component({
  selector: 'view-events-renderer',
  templateUrl: './view-events-renderer.component.html',
  styleUrls: ['./view-events-renderer.component.scss']
})
export class ViewEventsRenderer implements ICellRendererAngularComp {
  params;
  constructor() {
  }

  agInit(param) {
    this.params = param;
  }

  viewEvents() {
    this.params.context.parentComponent.viewEvents(this.params);
  }

  refresh(): boolean {
    return false;
  }
}
