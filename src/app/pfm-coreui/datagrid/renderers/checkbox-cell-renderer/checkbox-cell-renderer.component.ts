import { Component, OnInit } from '@angular/core';
import { ICellEditorAngularComp } from '@ag-grid-community/angular';

@Component({
  selector: 'checkbox-cell-renderer',
  templateUrl: './checkbox-cell-renderer.component.html',
  styleUrls: ['./checkbox-cell-renderer.component.scss']
})
export class CheckboxCellRendererComponent implements ICellEditorAngularComp {
  id: string;
  checked: boolean;
  label: string;
  showLabel = false;
  fieldName: string;
  isDisabled: boolean;
  constructor() {}

  agInit(params: any): void {
    this.checked = params.data.active.checked;
    this.label = params.data.active.label;
    this.id = 'checkboxCellRendererComponent' + params.rowIndex;
    this.showLabel = params.data.active.showLabel;
    this.fieldName = params.data.active.fieldName;
    this.isDisabled = params.data.active.disabled;
  }

  getValue(): any {
    return this.checked;
  }
}
