import { AfterViewInit, Component, ViewChild, ViewContainerRef } from '@angular/core';
import { ICellEditorAngularComp } from '@ag-grid-community/angular';
import { formatDate } from '@angular/common';

@Component({
  selector: 'date-picker-cell-editor',
  templateUrl: './date-picker-cell-editor.component.html',
  styleUrls: ['./date-picker-cell-editor.component.scss']
})
export class DatePickerCellEditorComponent implements ICellEditorAngularComp, AfterViewInit {

  params: any;
  value: Date;
  id: string;

  minDate: Date;
  maxDate: Date;

  agInit(params: any) {
    this.params = params;
    this.value = params.value;
    this.id = 'DatePickerCellEditorComponent-' + this.params.rowIndex;

    this.validateDate();
  }

  getValue(): string {
    return formatDate(this.value, 'MM/dd/yyyy', 'en-US');
  }

  ngAfterViewInit() {
  }

  private validateDate() {
    if (this.params.column && this.params.data) {
      const column = this.params.column.colId;
      const data = this.params.data;
      if (column) {
        if (column === 'startDate') {
          this.maxDate = new Date(data.endDate);
        } else if (column === 'endDate') {
          this.minDate = new Date(data.startDate);
        }
      }
    }
  }

  onValueChange(value: Date) {
    this.validateDate();
  }

}
