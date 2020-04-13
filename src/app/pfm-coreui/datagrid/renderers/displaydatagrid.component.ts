import { Component, EventEmitter, Input, OnInit, Output, HostListener } from '@angular/core';
import { AllCommunityModules, ColumnApi, GridApi, Module } from '@ag-grid-community/all-modules';

import { DatagridMbService } from '../../services/datagrid-mb.service';
import { DataGridMessage } from '../../models/DataGridMessage';
import { ListItem } from '../../../pfm-common-models/ListItem';

@Component({
  selector: 'pfm-displaydatagrid',
  templateUrl: './displaydatagrid.component.html',
  styleUrls: ['./displaydatagrid.component.scss']
})
export class DisplaydatagridComponent implements OnInit {
  @Input() columns: any;
  @Input() rows: any;
  @Input() showAddRow: boolean;
  @Input() tabToNextCell;
  @Output() onCellAction: EventEmitter<DataGridMessage> = new EventEmitter<DataGridMessage>();
  @Output() onAddNewRowEvent: EventEmitter<any> = new EventEmitter<any>();
  @Output() onGridIsReady: EventEmitter<GridApi> = new EventEmitter<GridApi>();
  @Output() onRowDragEndEvent: EventEmitter<any> = new EventEmitter<any>();
  @Output() onColumnIsReady: EventEmitter<ColumnApi> = new EventEmitter<ColumnApi>();

  defaultColDef: any;
  modules: Module[] = AllCommunityModules;
  api: GridApi;
  columnApi: ColumnApi;
  options: ListItem[];

  constructor(private datagridMBService: DatagridMbService) {
    datagridMBService.messageBus$.subscribe(message => {
      this.onCellAction.emit(message);
    });

    this.defaultColDef = {
      resizable: true,
      sortable: true,
      filter: true
    };
  }

  addNewRow(): void {
    this.onAddNewRowEvent.emit({ gridApi: this.api, action: 'add-single-row' });
  }

  handleAdd(item: ListItem): void {
    if (item) {
      if (item.id === 'add-row') {
        this.onAddNewRowEvent.emit({ gridApi: this.api, action: 'add-single-row' });
      } else if (item.id === 'add-year') {
        this.onAddNewRowEvent.emit({ gridApi: this.api, action: 'add-rows-from-year' });
      }
    }
  }

  onModelUpdated() {}

  onRowDragEnd(event: any): void {
    this.onRowDragEndEvent.emit(event);
  }

  onCellClicked(event: any): void {
    const message: DataGridMessage = new DataGridMessage();

    message.rowIndex = event.rowIndex;
    message.columnId = event.column.colId;
    message.message = 'cellClicked';
    message.rowData = event.data;
    message.messageType = 'grid-cell';

    this.onCellAction.emit(message);
  }

  onGridReady(params) {
    this.api = params.api;
    this.columnApi = params.columnApi;
    this.api.sizeColumnsToFit();
    this.onGridIsReady.emit(this.api);
    this.onColumnIsReady.emit(this.columnApi);
  }

  onGridSizeChanged() {
    this.api.sizeColumnsToFit();
  }

  onColumnResized(params) {
    if (params.source === 'columnResized' && params.finished) {
      this.api.sizeColumnsToFit();
    }
  }

  @HostListener('window:resize', ['$event'])
  onWindowResize(event: any) {
    if (this.api) {
      this.api.sizeColumnsToFit();
    }
  }

  ngOnInit() {
    // Populate dropdown options
    const item: ListItem = new ListItem();
    item.name = 'Add a new row';
    item.value = 'add-row';
    item.id = 'add-row';
    const item2: ListItem = new ListItem();
    item2.name = 'Add all rows from another year';
    item2.value = 'add-year';
    item2.id = 'add-year';
    this.options = [item, item2];
  }
}
