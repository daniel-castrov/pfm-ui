import { Component } from '@angular/core';
import { ICellRendererAngularComp } from '@ag-grid-community/angular';
import { formatDate } from '@angular/common';

@Component({
  selector: 'date-picker-cell-renderer',
  templateUrl: './date-picker-cell-renderer.component.html',
  styleUrls: ['./date-picker-cell-renderer.component.scss']
})
export class DatePickerCellRendererComponent implements ICellRendererAngularComp {

  params: any;
  value: string;

  agInit(params: any): void {
    this.params = params;
    this.value = params.value;
  }

  refresh(params: any): boolean {
    this.params = params;
    this.value = params.value;
    return true;
  }

}
