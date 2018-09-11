import { Component, OnInit } from '@angular/core';
import { ICellRendererAngularComp } from 'ag-grid-angular';

@Component({
  selector: 'app-actuals-cell-renderer',
  templateUrl: './actuals-cell-renderer.component.html',
  styleUrls: ['./actuals-cell-renderer.component.scss']
})
export class ActualsCellRendererComponent implements ICellRendererAngularComp {
  private params;

  constructor() { }

  agInit(param) {
    this.params = param;
  }

  refresh(): boolean {
    return true;
  }
}
