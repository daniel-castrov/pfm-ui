import { Component } from '@angular/core';
import { ICellRendererAngularComp } from 'ag-grid-angular';
import { ICellRendererParams } from "ag-grid";

@Component({
  template: `<input type="checkbox" (click)="onChange($event)" [checked]="params.value"/>`
})

export class CheckboxCellRenderer implements ICellRendererAngularComp {

  params: ICellRendererParams;

  constructor() { }

  agInit(params: ICellRendererParams): void {
    this.params = params;
  }

  onChange(event) {
    this.params.data[this.params.colDef.field] = event.target.checked;
    this.params.context.parentComponent.onAnchor(this.params);
  }

  refresh(params: ICellRendererParams): boolean {
    return true;
  }
}
