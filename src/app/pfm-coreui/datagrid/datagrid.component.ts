import { Component, EventEmitter, Input, OnInit, Output, HostListener, TemplateRef } from '@angular/core';
import { ColumnApi, GridApi, Module, SuppressKeyboardEventParams } from '@ag-grid-community/all-modules';

import { DatagridMbService } from '../services/datagrid-mb.service';
import { DataGridMessage } from '../models/DataGridMessage';
import { ListItem } from '../../pfm-common-models/ListItem';
import { AllModules } from '@ag-grid-enterprise/all-modules';

@Component({
  selector: 'pfm-datagrid',
  templateUrl: './datagrid.component.html',
  styleUrls: ['./datagrid.component.scss']
})
export class DatagridComponent implements OnInit {
  @Input() columns: any; // Data grid columns
  @Input() rows: any; // Data grid rows
  @Input() showAddDropdownCta: boolean; // Controls visibility of add dropdown CTA
  @Input() showAddSingleRow: boolean;
  @Input() showGrandTotal: boolean;
  @Input() showPagination = true; // Controls visibility and activation of pagination
  @Input() addDropdownCtaTooltip = 'Add'; // Add dropdown CTA tooltip
  @Input() tabToNextCell;
  @Input() isExternalFilterPresent;
  @Input() doesExternalFilterPass;
  @Input() excelMessage = 'UNCLASSIFIED / FOUO';
  @Input() suppressKeyboardEvent = true;
  @Input() rowDragManaged = true;
  @Input() pinnedTopRowData = [];
  @Input() overlayNoRowsTemplate;
  @Input() isMasterDetail = false;
  @Input() detailCellRendererParams = null;
  @Input() disableAddRow: boolean;
  @Input() addRowTooltip: string;

  private dropdownCtaOptions: ListItem[];

  get addDropdownCtaOptions() {
    return this.dropdownCtaOptions;
  }

  @Input()
  set addDropdownCtaOptions(val: ListItem[]) {
    this.dropdownCtaOptions = val;
    this.updateAddCTAOptions();
  }

  @Input() extras: TemplateRef<any>;

  @Output() cellAction: EventEmitter<DataGridMessage> = new EventEmitter<DataGridMessage>();
  @Output() addCtaEvent: EventEmitter<any> = new EventEmitter<any>();
  @Output() gridIsReady: EventEmitter<GridApi> = new EventEmitter<GridApi>();
  @Output() rowDragEnterEvent: EventEmitter<any> = new EventEmitter<any>();
  @Output() rowDragLeaveEvent: EventEmitter<any> = new EventEmitter<any>();
  @Output() rowDragEndEvent: EventEmitter<any> = new EventEmitter<any>();
  @Output() columnIsReady: EventEmitter<ColumnApi> = new EventEmitter<ColumnApi>();
  @Output() columnResized: EventEmitter<ColumnApi> = new EventEmitter<any>();

  excelMessageHeader: any;
  excelMessageFooter: any;
  excelStyles: any;
  defaultColDef: any;
  modules: Module[] = AllModules;
  api: GridApi;
  columnApi: ColumnApi;
  options: ListItem[];
  pageSize = 20;
  compId: number;

  onSuppressKeyboardEvent = (params: SuppressKeyboardEventParams) => {
    if (this.suppressKeyboardEvent) {
      if (params.event.code.toLowerCase() === 'tab') {
        return !this.tabToNextCell;
      }
      return true;
    }
    return false;
  };

  constructor(private datagridMBService: DatagridMbService) {}

  handleAddCta(itemId: string) {
    this.addCtaEvent.emit({ action: itemId });
  }

  handleAddDropdownCta(item: ListItem): void {
    if (item) {
      this.addCtaEvent.emit({ action: item.id });
    }
  }

  onRowDragEnter(event: any): void {
    this.rowDragEnterEvent.emit(event);
  }

  onRowDragLeave(event: any): void {
    this.rowDragLeaveEvent.emit(event);
  }

  onRowDragEnd(event: any): void {
    this.rowDragEndEvent.emit(event);
  }

  onCellClicked(event: any): void {
    const message: DataGridMessage = new DataGridMessage();

    message.rowIndex = event.rowIndex;
    message.columnId = event.column.colId;
    message.message = 'cellClicked';
    message.rowData = event.data;
    message.messageType = 'grid-cell';
    this.cellAction.emit(message);
  }

  onModelUpdated() {}

  onGridReady(params: any) {
    this.api = params.api;
    this.compId = params.api.gridCore.compId;
    this.columnApi = params.columnApi;
    this.api.sizeColumnsToFit();
    this.gridIsReady.emit(this.api);
    this.columnIsReady.emit(this.columnApi);
    this.api.paginationSetPageSize(this.pageSize);
  }

  onGridSizeChanged() {
    this.api.sizeColumnsToFit();
  }

  ngOnInit() {
    this.datagridMBService.messageBus$.subscribe(message => {
      if (this.compId === message.apiCompId) {
        this.cellAction.emit(message);
      }
    });

    this.defaultColDef = {
      resizable: true,
      sortable: true,
      filter: true
    };
    this.updateAddCTAOptions();
    this.excelMessageHeader = [
      [
        {
          styleId: 'message',
          data: {
            type: 'String',
            value: this.excelMessage
          },
          mergeAcross: this.columns.length - 1
        }
      ],
      []
    ];
    this.excelMessageFooter = [
      [],
      [
        {
          styleId: 'message',
          data: {
            type: 'String',
            value: this.excelMessage
          },
          mergeAcross: this.columns.length - 1
        }
      ]
    ];
    this.excelStyles = [
      {
        id: 'message',
        alignment: { horizontal: 'CenterAcrossSelection' },
        interior: {
          color: '#008000',
          pattern: 'Solid'
        },
        dataType: 'string'
      }
    ];
  }

  handlePageSizeChanged(pageSize: any) {
    this.api.paginationSetPageSize(this.pageSize);
  }

  // Exports to excel
  onExport() {
    const params = this.getExportParams();
    this.api.exportDataAsExcel(params);
  }

  // Gets parameters for the export
  getExportParams() {
    return {
      customHeader: this.excelMessageHeader,
      customFooter: this.excelMessageFooter
    };
  }

  // provides context menu options
  getContextMenuItems(params) {
    const result = [
      {
        name: 'Export',
        action: () => {
          params.context.onExport();
        }
      }
    ];
    return result;
  }

  onColumnResized(params) {
    this.columnResized.emit(params);
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

  updateAddCTAOptions() {
    if (this.dropdownCtaOptions) {
      this.options = this.dropdownCtaOptions;
    } else {
      // Populate dropdown options with default
      const item: ListItem = new ListItem();
      item.name = 'Add a new row';
      item.value = 'add-single-row';
      item.id = 'add-single-row';
      const item2: ListItem = new ListItem();
      item2.name = 'Add all rows from another year';
      item2.value = 'add-rows-from-year';
      item2.id = 'add-rows-from-year';
      this.options = [item, item2];
    }
  }
}
