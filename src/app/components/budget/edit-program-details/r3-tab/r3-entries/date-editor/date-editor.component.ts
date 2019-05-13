import {Component} from '@angular/core';
import {ICellEditorAngularComp} from 'ag-grid-angular';
import {IAfterGuiAttachedParams, ICellEditorParams} from 'ag-grid-community';

@Component({
  selector: 'date-renderer',
  templateUrl: './date-editor.component.html',
  styleUrls: ['./date-editor.component.scss']
})
export class DateEditorComponent implements ICellEditorAngularComp {
  params: ICellEditorParams;
  year;

  agInit(param: ICellEditorParams ) {
    this.params = param;
    this.year = param.column.getParent().getOriginalColumnGroup().getColGroupDef()['colId'];
  }

  refresh(): boolean {
    return false;
  }

  afterGuiAttached(params?: IAfterGuiAttachedParams): void {
  }

  focusIn(): void {
  }

  focusOut(): void {
  }

  getValue(): any {
    return this.params.value;
  }

  isCancelAfterEnd(): boolean {
    return false;
  }

  isCancelBeforeStart(): boolean {
    return false;
  }

  isPopup(): boolean {
    return true;
  }

  close() {
    this.params.api.stopEditing(false);
  }
}
