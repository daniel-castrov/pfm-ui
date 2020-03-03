import { Component, EventEmitter, Input, OnInit, Output, HostListener } from '@angular/core';
import { DataGridMessage } from '../models/DataGridMessage';
import { ColumnApi, GridApi } from '@ag-grid-community/all-modules';

@Component({
  selector: 'pfm-tree-datagrid',
  templateUrl: './tree-datagrid.component.html',
  styleUrls: ['./tree-datagrid.component.scss']
})
export class TreeDatagridComponent implements OnInit {

  @Input() fieldsToGroup: any[];
  @Input() fieldsToSum: any[];
  @Input() fieldsToAverage: any[]; // just to illistrate extending sum/average/max ect...
  @Input() rows: any[];
  @Input() showAddRow = false;
  @Input() tabToNextCell;

  @Output() cellAction: EventEmitter<DataGridMessage> = new EventEmitter<DataGridMessage>();
  @Output() addNewRowEvent: EventEmitter<any> = new EventEmitter<any>();
  @Output() gridIsReady: EventEmitter<GridApi> = new EventEmitter<GridApi>();
  @Output() rowDragEndEvent: EventEmitter<any> = new EventEmitter<any>();
  @Output() columnIsReady: EventEmitter<ColumnApi> = new EventEmitter<ColumnApi>();

  gridApi: GridApi;
  columnsForGrid: any[];
  rowsForGrid: any;

  constructor() { }

  onGridIsReady(gridApi: any): void {
    this.gridApi = gridApi.api;
    this.gridApi.setRowData(this.rowsForGrid);
  }

  ngOnInit() {
    this.columnsForGrid = this.fieldsToGroup;
    this.rowsForGrid = this.rows;
  }

  onGridSizeChanged() {
    this.gridApi.sizeColumnsToFit();
  }

  onColumnResized(params) {
    if (params.source === 'columnResized' && params.finished) {
      this.gridApi.sizeColumnsToFit();
    }
  }

  @HostListener('window:resize', ['$event'])
  onWindowResize(event: any) {
    if (this.gridApi) {
      this.gridApi.sizeColumnsToFit();
    }
  }

}
