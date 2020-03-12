import { Component, Input, OnInit, HostListener } from '@angular/core';
import { NewsItem } from '../models/NewsItem';
import { Router } from '@angular/router';
import * as ClassicEditor from '@ckeditor/ckeditor5-build-classic';
import { ActionCellRendererComponent } from 'src/app/pfm-coreui/datagrid/renderers/action-cell-renderer/action-cell-renderer.component';
import { Column, CellPosition, GridApi, ColumnApi } from '@ag-grid-community/all-modules';
import { DataGridMessage } from 'src/app/pfm-coreui/models/DataGridMessage';
import { Action } from '../../pfm-common-models/Action';
import { AppModel } from 'src/app/pfm-common-models/AppModel';
import { DialogService } from 'src/app/pfm-coreui/services/dialog.service';
import { PfmHomeService } from '../services/pfm-home-service';
import { formatDate } from '@angular/common';
import { DeleteDialogInterface } from 'src/app/programming-feature/requests/requests-details/requests-funding-line-grid/requests-funding-line-grid.component';

@Component({
  selector: 'pfm-latest-news-pod',
  templateUrl: './latest-news-pod.component.html',
  styleUrls: ['./latest-news-pod.component.scss']
})
export class LatestNewsPodComponent implements OnInit {

  @Input() newsList: NewsItem[];

  showDeleteRowDialog: boolean;
  showNewsItemDlg: boolean;
  Editor = ClassicEditor;

  latestNewsGridActionState = {
    VIEW: {
      canSave: false,
      canEdit: true,
      canDelete: true,
      canUpload: false,
      isSingleDelete: true
    },
    EDIT: {
      canEdit: false,
      canSave: true,
      canDelete: true,
      canUpload: false,
      isSingleDelete: true
    }
  };
  gridApi: GridApi;
  columnApi: ColumnApi;
  id = 'latest-news-component';
  busy: boolean;
  selectedRowId: number;
  selectedRow: NewsItem;

  columns: any[];
  rowDragEnterEvent: any;
  rowDragLeaveEvent: any;
  newsItems: NewsItem[];
  newsItemsFromServer: NewsItem[];

  currentRowDataState: LatestNewsRowDataStateInterface = {};

  newsItem: NewsItem;

  switchMode = false;

  startDate: Date;
  startString = '';
  endDate: Date;
  endString = '';
  maxDate: Date;
  minDate: Date;

  startTime: Date;
  endTime: Date;

  deleteDialog: DeleteDialogInterface = { title: 'Delete' };

  constructor(

    private appModel: AppModel,
    private homeService: PfmHomeService,
    private dialogService: DialogService,
    private router: Router) { }

  ngOnInit() {
    this.loadLastNews();

    this.columns = [
      {
        headerName: 'Order',
        field: 'order',
        maxWidth: 75,
        minWidth: 75,
        rowDrag: true,
        valueGetter(params) { return params.node.rowIndex + 1; },
        cellClass: 'numeric-class',
        cellStyle: { display: 'flex', 'align-items': 'right' }
      },
      {
        headerName: 'Title',
        field: 'title',
        editable: true,
        maxWidth: 400,
        minWidth: 400,
        cellClass: 'text-class',
        cellStyle: { display: 'flex', 'align-items': 'center', 'white-space': 'normal', 'justify- content': 'center' }
      },
      {
        headerName: 'Start Date',
        field: 'begin',
        editable: true,
        suppressMovable: true,
        filter: false,
        sortable: false,
        suppressMenu: true,
        cellClass: 'text-class',
        cellStyle: { display: 'flex', 'align-items': 'center', 'white-space': 'normal' },
        valueGetter: ({ node }) => {
          const { begin } = node.data;
          return begin ? new Date(begin) : '';
        },
        minWidth: 145,
      },
      {
        headerName: 'End Date',
        field: 'end',
        editable: true,
        suppressMovable: true,
        filter: false,
        sortable: false,
        suppressMenu: true,
        cellClass: 'text-class',
        cellStyle: { display: 'flex', 'align-items': 'center', 'white-space': 'normal' },
        valueGetter: ({ node }) => {
          const { end } = node.data;
          return end ? new Date(end) : '';
        },
        minWidth: 145,
      },
      {
        headerName: 'Active',
        field: 'active',
        editable: true,
        suppressMovable: true,
        filter: false,
        sortable: false,
        suppressMenu: true,
        cellClass: 'text-class',
        cellStyle: { display: 'flex', 'align-items': 'center', 'white-space': 'normal', 'justify-content': 'center' },
        minWidth: 145,
        cellRenderer: params => {
          return `<input disabled type='checkbox' ${params.value ? 'checked' : ''} />`;
        }
      },
      {
        headerName: 'Actions',
        field: 'actions',
        minWidth: 175,
        maxWidth: 175,
        cellRendererFramework: ActionCellRendererComponent
      }
    ];

    this.loadDates();
  }

  loadDates() {
    this.startDate = new Date();
    this.startDate.setHours(12, 0);
  }

  loadLastNews() {
    this.homeService.getNewsItems().subscribe(
      resp => {
        this.busy = false;
        const result = (resp as any).result;
        if (result instanceof Array) {
          this.newsItems = new Array<NewsItem>(result.length);
          for (const ni of result as Array<NewsItem>) {
            this.initClientNI(ni);
            this.newsItems[ni.order - 1] = ni;
          }
          this.newsItemsFromServer = [...this.newsItems];
        }
      },
      error => {
        this.busy = false;
        this.dialogService.displayDebug(error);
      });

  }

  @HostListener('document:mouseup', ['$event'])
  onMouseUp(event: MouseEvent) {
    if (this.rowDragEnterEvent && this.rowDragLeaveEvent) {
      if (this.rowDragLeaveEvent.event.timeStamp > this.rowDragEnterEvent.event.timeStamp) {
        this.rowDragEnterEvent = null;
        this.rowDragLeaveEvent = null;
        this.newsItems = [...this.newsItemsFromServer];
      }
    }
  }

  onRowDragEnter(event: any): void {
    this.rowDragEnterEvent = event;
  }

  onRowDragLeave(event: any): void {
    this.rowDragLeaveEvent = event;
  }

  onRowDragEnd(event: any): void {
    // Ensure drag ended in grid before moving anything
    if (event.overIndex >= 0) {
      this.rowDragEnterEvent = null;
      this.rowDragLeaveEvent = null;
      const newIndex: number = event.overIndex;
      const oldIndex: number = event.node.data.order - 1;

      if (newIndex !== oldIndex) {
        // Move mp to new position
        this.newsItems.splice(newIndex, 0, this.newsItems.splice(oldIndex, 1)[0]);
        // Update order in model and server
        if (newIndex < oldIndex) {
          for (let i = newIndex; i <= oldIndex; i++) {
            this.newsItems[i].order = i + 1;
          }
          this.updateRows(newIndex, oldIndex + 1);
        } else {
          for (let i = oldIndex; i <= newIndex; i++) {
            this.newsItems[i].order = i + 1;
          }
          this.updateRows(oldIndex, newIndex + 1);
        }
      }
    }
    // Let the grid know about any changes
    this.gridApi.setRowData(this.newsItems);
  }

  onGridIsReady(gridApi: GridApi): void {
    this.gridApi = gridApi;
    this.loadLastNews();
    this.gridApi.setRowData(this.newsItems);
  }

  onColumnIsReady(columnApi: ColumnApi): void {
    this.columnApi = columnApi;
  }

  handleCellAction(cellAction: DataGridMessage): void {
    switch (cellAction.message) {
      case 'save':
        this.saveRow(cellAction.rowIndex);
        break;
      case 'edit':
        if (!this.currentRowDataState.isEditMode) {
          this.currentRowDataState.isAddMode = false;
          this.editRow(cellAction.rowIndex, true);
        }
        break;
      case 'delete-row':
        if (!this.currentRowDataState.isEditMode) {
          this.displayDeleteDialog(cellAction, this.deleteRow.bind(this));
        }
        break;
      case 'cancel':
        if (this.currentRowDataState.isEditMode && !this.currentRowDataState.isAddMode) {
          this.cancelRow(cellAction.rowIndex);
        } else {
          this.deleteRow(cellAction.rowIndex);
        }
        break;
    }
  }

  save(): void {

    this.showNewsItemDlg = false;
    const idx = this.newsItems.findIndex(x => this.newsItem.order === x.order);

    this.newsItems[idx].title = this.newsItem.title;
    this.newsItems[idx].text = this.newsItem.text;
    this.newsItems[idx].begin = this.newsItem.begin;
    this.newsItems[idx].end = this.newsItem.end;
    this.newsItems[idx].active = this.newsItem.active;
    this.saveRow(idx);
    this.gridApi.refreshCells();
  }

  handleCancel(): void {
    this.showNewsItemDlg = false;
    const idx = this.newsItems.findIndex(x => this.newsItem.order === x.order);
    if (this.currentRowDataState.isEditMode && !this.currentRowDataState.isAddMode) {
      this.cancelRow(idx);
    } else {
      this.deleteRow(idx);
    }
    this.currentRowDataState.isEditMode = false;
    this.currentRowDataState.isAddMode = false;
    this.gridApi.refreshCells();
  }

  onAddNewRow(event: any): void {
    if (event.action === 'add-single-row') {
      const ni = new NewsItem();
      if (this.newsItems.length === 0) {
        ni.order = 1;
      } else {
        ni.order = this.newsItems.length + 1;
      }
      ni.title = '';
      ni.text = '';
      ni.begin = this.startDate;
      ni.actions = new Action();
      ni.actions.canEdit = false;
      ni.actions.canSave = true;
      ni.actions.canDelete = true;
      ni.actions.isSingleDelete = true;
      ni.actions.canUpload = false;
      this.newsItems.push(ni);

      this.currentRowDataState.isAddMode = true;
      this.gridApi.setRowData(this.newsItems);

      this.newsItem = ni;

      this.editRow(this.newsItems.length - 1);
    }
  }

  // Overwrite tab functionality to tab back and forth from title and description
  private tabToNextCell(params) {
    const rowIndex = params.previousCellPosition.rowIndex;
    let nextColumn: Column;
    let nextCell: CellPosition = params.nextCellPosition;
    // if the column is title
    if (params.previousCellPosition.column.colId === 'title' && params.backwards === true) {
      nextColumn = this.columnApi.getColumn('description');
      nextCell = {
        rowIndex,
        column: nextColumn,
        rowPinned: undefined
      };
    } else if (params.previousCellPosition.column.colId === 'description' && params.backwards === false) {
      nextColumn = this.columnApi.getColumn('title');
      nextCell = {
        rowIndex,
        column: nextColumn,
        rowPinned: undefined
      };
    }
    return nextCell;
  }

  private editMode(rowIdx: number) {

    this.currentRowDataState.currentEditingRowIndex = rowIdx;
    this.currentRowDataState.isEditMode = true;
    this.showNewsItemDlg = true;

  }

  private viewMode(rowIdx: number) {

    this.currentRowDataState.currentEditingRowIndex = 0;
    this.currentRowDataState.isEditMode = false;
    this.currentRowDataState.isAddMode = false;
    this.gridApi.stopEditing();
    this.newsItems[rowIdx].actions = this.latestNewsGridActionState.VIEW;
    this.newsItems.forEach(row => {
      row.isDisabled = false;
    });
    this.gridApi.setRowData(this.newsItems);
  }

  private saveRow(rowId: number) {
    let errorMsg = '';
    let isError = false;

    // Note stopEditing saves edits to model.  Since changes aren't saved to server if validation fails this is ok.
    this.gridApi.stopEditing();
    const row: NewsItem = this.newsItems[rowId];

    // Check columns not empty
    if (row.text.length > 0 && row.title.length <= 200 && row.begin != null) {
      // Convert to server mp
      const serverNI: NewsItem = this.convertToServerNI(row);
      this.busy = true;
      // Create or update? Check for presence of mp id
      if (!serverNI.id) {
        this.homeService.createNewsItem(serverNI).subscribe(
          resp => {
            this.busy = false;
            this.newsItems[rowId] = (resp as any).result;
            this.newsItems[rowId].actions = this.latestNewsGridActionState.EDIT;

            // Update view
            this.viewMode(rowId);
            this.gridApi.setRowData(this.newsItems);
          },
          error => {
            this.busy = false;
            this.dialogService.displayDebug(error);
          });
      } else {
        // Ensure creation information is preserved
        this.homeService.updateNewsItem([serverNI]).subscribe(
          resp => {
            this.busy = false;
            // Update view
            this.viewMode(rowId);
            this.gridApi.setRowData(this.newsItems);
          },
          error => {
            this.busy = false;
            this.dialogService.displayDebug(error);
          });
      }
    } else {
      if (row.title.length === 0) {
        errorMsg = 'The Title is empty. ';
        isError = true;
      }

      if (row.text.length === 0) {
        errorMsg = 'The Text is empty. ';
        isError = true;
      }
      if (row.title.length > 200) {
        errorMsg = errorMsg + 'The Title is longer than the max of 200 characters.';
        isError = true;
      }

      if (!row.begin) {
        errorMsg = errorMsg + 'The Start Date is empty.';
        isError = true;
      }
      if (isError) {
        this.dialogService.displayError(errorMsg);
      }
      this.editRow(rowId);
    }
  }

  private updateRows(beginRowId: number, endRowId?: number) {
    this.busy = true;
    const clientNIs = this.newsItems.slice(beginRowId, endRowId);
    // Ensure there is something to update
    if (clientNIs.length) {
      // Create copies of updated mps with client only properties excluded, server doesn't know about them
      const updateMps: NewsItem[] = new Array<NewsItem>();
      for (const clientNI of clientNIs) {
        updateMps.push(this.convertToServerNI(clientNI));
      }
      this.homeService.updateNewsItem(updateMps).subscribe(
        resp => {
          this.busy = false;
        },
        error => {
          this.busy = false;
          this.dialogService.displayDebug(error);
        });
    }
  }

  private cancelRow(rowIndex: number) {
    this.newsItems[rowIndex] = this.currentRowDataState.currentEditingRowData;
    this.viewMode(rowIndex);
  }

  private editRow(rowIdx: number, updatePreviousState?: boolean) {
    if (updatePreviousState) {
      this.currentRowDataState.currentEditingRowData = { ...this.newsItems[rowIdx] };
    }
    this.newsItem = { ...this.newsItems[rowIdx] };
    // edit mode
    this.editMode(rowIdx);
  }

  private deleteRow(rowIndex: number) {
    if (this.currentRowDataState.isAddMode && !this.currentRowDataState.isEditMode) {

      this.newsItems.splice(rowIndex, 1);
      this.newsItems.forEach(row => {
        row.order--;
      });
      this.currentRowDataState.currentEditingRowIndex = 0;
      this.currentRowDataState.isEditMode = false;
      this.currentRowDataState.isAddMode = false;
      this.gridApi.stopEditing();
      this.newsItems.forEach(row => {
        row.isDisabled = false;
      });
      this.gridApi.setRowData(this.newsItems);
    } else {
      this.onDeleteRow(rowIndex);
    }
  }

  private displayDeleteDialog(cellAction: DataGridMessage, deleteFunction: (rowIndex: number) => void) {
    this.deleteDialog.cellAction = cellAction;
    this.deleteDialog.delete = deleteFunction;
    this.deleteDialog.display = true;
  }

  onCancelDeleteDialog() {
    if (this.currentRowDataState.isAddMode && !this.currentRowDataState.isEditMode) {
      this.onDeleteRow(this.newsItems.length - 1);
    }
    this.closeDeleteDialog();
  }

  onDeleteData() {
    this.deleteDialog.delete(this.deleteDialog.cellAction.rowIndex);
    this.closeDeleteDialog();
  }

  private closeDeleteDialog() {
    this.deleteDialog.cellAction = null;
    this.deleteDialog.delete = null;
    this.deleteDialog.display = false;
    this.currentRowDataState.isEditMode = false;
  }

  private onDeleteRow(rowId: number) {
    this.busy = true;
    this.homeService.deleteNewsItem(this.newsItems[rowId].id).subscribe(
      resp => {
        this.newsItems.splice(rowId, 1);
        for (let i = rowId; i < this.newsItems.length; i++) {
          this.newsItems[i].order = this.newsItems[i].order - 1;
        }
        // Update view
        this.gridApi.setRowData(this.newsItems);
        // Let service know about ordering changes
        this.updateRows(rowId);
        this.busy = false;
      },
      error => {
        this.busy = false;
        this.dialogService.displayDebug(error);
      });

    this.showDeleteRowDialog = false;
  }

  private convertToServerNI(clientNI: NewsItem): NewsItem {
    // The server doesn't know anything about some client side properties of the MissionPriority.  Copy clientNI but
    // exclude those properties that the server doesn't know anything about.
    // Note - ignoring update properties due to server setting during call
    const serverNI: NewsItem = new NewsItem();
    serverNI.id = clientNI.id;
    serverNI.title = clientNI.title;
    serverNI.text = clientNI.text;
    serverNI.order = clientNI.order;
    serverNI.begin = clientNI.begin;
    serverNI.end = clientNI.end;
    serverNI.active = clientNI.active;
    return serverNI;
  }

  private initClientNI(clientNI: NewsItem): void {
    if (!clientNI.actions) {
      clientNI.actions = new Action();
      clientNI.actions.canUpload = false;
      clientNI.actions.canSave = false;
      clientNI.actions.canEdit = true;
      clientNI.actions.canDelete = true;
      clientNI.actions.isSingleDelete = true;
    }
  }

  canShow(newsItem: NewsItem) {
    const now = new Date();
    let show = now >= newsItem.begin && newsItem.active;
    if (newsItem.end) {
      show = show && now <= newsItem.end;
    }
    return show;
  }
}

export interface LatestNewsRowDataStateInterface {

  currentEditingRowIndex?: number;
  isAddMode?: boolean;
  isEditMode?: boolean;
  currentEditingRowData?: NewsItem;
}
