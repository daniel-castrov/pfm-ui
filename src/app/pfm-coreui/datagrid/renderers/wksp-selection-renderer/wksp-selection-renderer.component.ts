import { Component } from '@angular/core';
import { ICellEditorAngularComp } from '@ag-grid-community/angular';

@Component({
  selector: 'app-wksp-selection-renderer',
  templateUrl: './wksp-selection-renderer.component.html',
  styleUrls: ['./wksp-selection-renderer.component.scss']
})
export class WkspSelectionRendererComponent implements ICellEditorAngularComp {
  constructor() {}

  data: any;
  agInit(params: any): void {
    this.data = params.data;
  }

  getValue(): any {}
}
