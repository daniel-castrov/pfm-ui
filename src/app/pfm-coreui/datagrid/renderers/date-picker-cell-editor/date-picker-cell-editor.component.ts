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
  stringValue = '';

  minDate: Date;
  maxDate: Date;

  agInit(params: any) {
    this.params = params;
    if (params.value) {
      this.value = new Date(params.value);
    }
    this.stringValue = params.value;
    this.id = 'DatePickerCellEditorComponent-' + this.params.rowIndex;
    this.validateDateRange();
  }

  getValue(): string {
    return this.stringValue;
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
    if (this.validateDateValue(String(this.value))) {
      this.stringValue = formatDate(this.value, 'MM/dd/yyyy', 'en-US');
    }
    this.validateDateRange();
  }

  onKeyPress(event: KeyboardEvent) {
    const keyCode = event.code;
    if (!(
      keyCode.toLowerCase().indexOf('numpad') > -1 ||
      keyCode.toLowerCase().indexOf('digit') > -1 ||
      keyCode.toLowerCase().indexOf('slash') > -1
    )) {
      event.preventDefault();
      return;
    }
    if (keyCode.toLowerCase().indexOf('slash') > -1) {
      return true;
    }
    const isNumber = Number.parseInt(keyCode.substr(keyCode.length - 1, keyCode.length), 10);
    return !Number.isNaN(isNumber);
  }

  onNgModelChange(newValue: string) {
    this.stringValue = newValue;
  }

  onBlur(event: any) {
    if (this.validateDateValue(event.target.value)) {
      this.value = new Date(event.target.value);
      this.stringValue = formatDate(this.value, 'MM/dd/yyyy', 'en-US');
    } else {
      this.value = null;
    }
  }

  private validateDateValue(dateString: string) {
    if (dateString) {
      try {
        const date = new Date(dateString);
        const dateSplit = formatDate(dateString, 'MM/dd/yyyy', 'en-US').split('/');
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
