import { AfterViewInit, Component } from '@angular/core';
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

    this.validateDateRange();
  }

  getValue(): string {
    return this.value ? formatDate(this.value, 'MM/dd/yyyy', 'en-US') : '';
  }

  ngAfterViewInit() {
  }

  private validateDateRange() {
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
    this.validateDateRange();
  }

  onBlur(event: any) {
    if (this.validateDateValue(event.target.value)) {
      this.value = event.target.value;
    } else {
      this.value = null;
    }
  }

  private validateDateValue(dateString: string) {
    if (dateString) {
      try {
        const date = new Date(dateString);
        const dateSplit = dateString.split('/');
        if (date.getFullYear() === Number(dateSplit[2]) &&
          date.getMonth() === Number(dateSplit[0]) - 1 &&
          date.getDate() === Number(dateSplit[1])) {
          return true;
        }
      } catch (err) {
        return false;
      }
    }
    return false;
  }

}
