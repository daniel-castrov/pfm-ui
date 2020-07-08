import { Component, OnInit, ViewChild } from '@angular/core';
import { FileMetaData } from 'src/app/pfm-common-models/FileMetaData';
import { ActivatedRoute, Router } from '@angular/router';
import { RestResponse } from 'src/app/util/rest-response';
import { ListItem } from 'src/app/pfm-common-models/ListItem';
import { getListItems } from '../../models/enumerations/execution-btr-subtype.model';
import { FormGroup, FormControl, Validators, ValidatorFn, ValidationErrors } from '@angular/forms';
import { GridApi, ColDef } from '@ag-grid-community/all-modules';
import { ExecutionLine } from '../../models/execution-line.model';
import { ExecutionLineService } from '../../services/execution-line.service';
import { SecureDownloadComponent } from 'src/app/pfm-secure-filedownload/secure-download/secure-download.component';
import { CurrencyPipe } from '@angular/common';
import { ActionCellRendererComponent } from 'src/app/pfm-coreui/datagrid/renderers/action-cell-renderer/action-cell-renderer.component';
import { DropdownCellRendererComponent } from 'src/app/pfm-coreui/datagrid/renderers/dropdown-cell-renderer/dropdown-cell-renderer.component';
import { NumericCellEditor } from 'src/app/ag-grid/cell-editors/NumericCellEditor';
import { AllowedCharacters } from 'src/app/ag-grid/cell-editors/AllowedCharacters';
import { DataGridMessage } from 'src/app/pfm-coreui/models/DataGridMessage';
import { Attachment } from 'src/app/pfm-common-models/Attachment';

@Component({
  selector: 'pfm-realign-funds',
  templateUrl: './realign-funds.component.html',
  styleUrls: ['./realign-funds.component.scss']
})
export class RealignFundsComponent implements OnInit {
  @ViewChild(SecureDownloadComponent)
  secureDownloadComponent: SecureDownloadComponent;

  actionState = {
    VIEW: {
      canSave: false,
      canEdit: true,
      canDelete: true,
      canUpload: false,
      isSingleDelete: true,
      hasHistory: false
    },
    VIEW_NO_DELETE: {
      canSave: false,
      canEdit: true,
      canDelete: false,
      canUpload: false,
      isSingleDelete: true,
      hasHistory: false
    },
    EDIT: {
      canEdit: false,
      canSave: true,
      canDelete: true,
      canUpload: false,
      isSingleDelete: true,
      hasHistory: false
    }
  };

  title: string;
  showUploadDialog: boolean;
  busy: boolean;
  subtypes: ListItem[];
  form: FormGroup;
  fromRows: ExecutionLine[] = [];
  fromColumnDefinitions: ColDef[];
  fromGridApi: GridApi;
  toRows: ExecutionLine[] = [];
  toColumnDefinitions: any[];
  toGridApi: GridApi;
  cellStyle: any;
  selectedExecutionLine: ExecutionLine;
  executionYear: number;
  executionYearTwoDigits: string;
  attachmentsUploaded: ListItem[] = [];
  attachments: Attachment[] = [];
  currentToRowDataState: RowDataStateInterface = {};

  constructor(
    private route: ActivatedRoute,
    private executionLineService: ExecutionLineService,
    private currencyPipe: CurrencyPipe,
    private router: Router
  ) {}

  ngOnInit(): void {
    history.state.type = 'BTR'; // TODO delete this
    this.executionYear = Number(this.route.snapshot.paramMap.get('exeYear'));
    if (this.executionYear) {
      this.executionYearTwoDigits = this.executionYear.toString().substr(2, 4);
    }
    if (history.state.type) {
      this.title =
        history.state.type === 'BTR'
          ? `BTR Update for Execution FY${this.executionYearTwoDigits}`
          : `Update for Execution FY${this.executionYearTwoDigits}`;

      this.subtypes = getListItems();
      this.loadForm();
      this.cellStyle = { display: 'flex', 'align-items': 'center', 'white-space': 'normal' };
      this.setupGrids();
      this.getAttachment();
    }
  }

  loadForm(): void {
    this.form = new FormGroup({
      subtype: new FormControl(null, [Validators.required]),
      notes: new FormControl()
    });
  }

  setupGrids(): void {
    this.setupFromGrid();
    this.setupToGrid();
  }

  setupFromGrid(): void {
    this.fromColumnDefinitions = [
      {
        headerName: 'Execution Line',
        field: 'executionLine',
        colId: 'executionLine',
        editable: false,
        suppressMovable: true,
        filter: false,
        sortable: false,
        suppressMenu: true,
        cellClass: 'pfm-datagrid-text'
      },
      {
        headerName: `FY${this.executionYearTwoDigits}`,
        field: 'fy',
        editable: false,
        suppressMovable: true,
        filter: false,
        sortable: false,
        suppressMenu: true,
        cellClass: 'justify-content-center',
        cellStyle: this.cellStyle,
        maxWidth: 80,
        minWidth: 80
      },
      {
        headerName: 'TOA',
        field: 'toa',
        editable: false,
        suppressMovable: true,
        filter: false,
        sortable: false,
        suppressMenu: true,
        cellClass: 'pfm-datagrid-numeric-class',
        cellStyle: this.cellStyle,
        maxWidth: 200,
        minWidth: 200,
        valueFormatter: params =>
          this.currencyPipe.transform(params.data[params.colDef.field], 'USD', 'symbol', '1.2-2')
      },
      {
        headerName: 'Released',
        field: 'released',
        editable: false,
        suppressMovable: true,
        filter: false,
        sortable: false,
        suppressMenu: true,
        cellClass: 'pfm-datagrid-numeric-class',
        cellStyle: this.cellStyle,
        maxWidth: 120,
        minWidth: 120,
        valueFormatter: params =>
          this.currencyPipe.transform(params.data[params.colDef.field], 'USD', 'symbol', '1.2-2')
      },
      {
        headerName: 'Withhold',
        field: 'withheld',
        editable: false,
        suppressMovable: true,
        filter: false,
        sortable: false,
        suppressMenu: true,
        cellClass: 'pfm-datagrid-numeric-class',
        cellStyle: this.cellStyle,
        maxWidth: 150,
        minWidth: 150,
        valueFormatter: params =>
          this.currencyPipe.transform(params.data[params.colDef.field], 'USD', 'symbol', '1.2-2')
      }
    ];
  }

  setupToGrid(): void {
    this.toColumnDefinitions = [
      {
        headerName: 'Execution Line',
        field: 'executionLine',
        colId: 'executionLine',
        editable: true,
        suppressMovable: true,
        filter: false,
        sortable: false,
        suppressMenu: true,
        cellClass: 'pfm-datagrid-text',
        cellEditorFramework: DropdownCellRendererComponent,
        cellEditorParams: () => {
          return {
            values: ['Exe5', 'Exe6', 'Exe7']
          };
        }
      },
      {
        headerName: `FY${this.executionYearTwoDigits}`,
        field: 'fy',
        editable: false,
        suppressMovable: true,
        filter: false,
        sortable: false,
        suppressMenu: true,
        cellClass: 'justify-content-center',
        cellStyle: this.cellStyle,
        maxWidth: 80,
        minWidth: 80
      },
      {
        headerName: 'TOA',
        field: 'toa',
        editable: false,
        suppressMovable: true,
        filter: false,
        sortable: false,
        suppressMenu: true,
        cellClass: 'pfm-datagrid-numeric-class',
        cellStyle: this.cellStyle,
        maxWidth: 200,
        minWidth: 200,
        valueFormatter: params =>
          this.currencyPipe.transform(params.data[params.colDef.field], 'USD', 'symbol', '1.2-2')
      },
      {
        headerName: 'Released',
        field: 'released',
        editable: false,
        suppressMovable: true,
        filter: false,
        sortable: false,
        suppressMenu: true,
        cellClass: 'pfm-datagrid-numeric-class',
        cellStyle: this.cellStyle,
        maxWidth: 120,
        minWidth: 120,
        valueFormatter: params =>
          this.currencyPipe.transform(params.data[params.colDef.field], 'USD', 'symbol', '1.2-2')
      },
      {
        headerName: 'Withhold',
        field: 'withheld',
        editable: false,
        suppressMovable: true,
        filter: false,
        sortable: false,
        suppressMenu: true,
        cellClass: 'pfm-datagrid-numeric-class',
        cellStyle: this.cellStyle,
        maxWidth: 150,
        minWidth: 150,
        valueFormatter: params =>
          this.currencyPipe.transform(params.data[params.colDef.field], 'USD', 'symbol', '1.2-2')
      },
      {
        headerName: 'Amount',
        field: 'amount',
        editable: true,
        suppressMovable: true,
        filter: false,
        sortable: false,
        suppressMenu: true,
        cellClass: 'pfm-datagrid-numeric-class',
        cellStyle: this.cellStyle,
        maxWidth: 150,
        minWidth: 150,
        cellEditor: NumericCellEditor.create({
          returnUndefinedOnZero: false,
          allowedCharacters: AllowedCharacters.DIGITS_AND_MINUS_AND_DECIMAL_POINT
        }),
        cellRenderer: params => params.value,
        valueFormatter: params =>
          this.currencyPipe.transform(params.data[params.colDef.field], 'USD', 'symbol', '1.2-2')
      },
      {
        headerName: 'Actions',
        field: 'actions',
        editable: false,
        suppressMovable: true,
        filter: false,
        sortable: false,
        suppressMenu: true,
        cellClass: 'text-class',
        cellStyle: this.cellStyle,
        maxWidth: 150,
        minWidth: 150,
        cellRendererFramework: ActionCellRendererComponent
      }
    ];
  }

  setupFromLoadRows(): void {
    const executionLineId = this.route.snapshot.paramMap.get('id');
    this.executionLineService.getById(executionLineId).subscribe((resp: RestResponse<ExecutionLine>) => {
      this.selectedExecutionLine = resp.result;
      this.fromRows = [this.selectedExecutionLine];
      this.fromGridApi.setRowData(this.fromRows);
    });
  }

  setupToLoadRows(): void {
    this.toGridApi.setRowData(this.toRows);
  }

  onFromGridIsReady(gridApi: GridApi): void {
    this.fromGridApi = gridApi;
    this.setupFromLoadRows();
  }

  onToGridIsReady(gridApi: GridApi): void {
    this.toGridApi = gridApi;
    this.setupToLoadRows();
  }

  handleAttachment(newFile: FileMetaData): void {
    this.showUploadDialog = false;
    if (newFile) {
      const attachment = new Attachment();
      attachment.file = newFile;
      this.attachments.push(attachment);
      this.attachmentsUploaded.push({
        id: attachment.file.id,
        isSelected: false,
        name: attachment.file.name,
        value: attachment.file.id,
        rawData: attachment
      });
    }
  }

  downloadAttachment(file: ListItem): void {
    const fileMetaData = new FileMetaData();
    fileMetaData.id = file.value;
    fileMetaData.name = file.name;
    this.secureDownloadComponent.downloadFile(fileMetaData);
  }

  getAttachment(): void {
    // TODO pull real data from database when there is collection defined.
    const mockup = [];
    mockup.forEach(attachment => {
      this.attachmentsUploaded.push({
        id: attachment.file.id,
        isSelected: false,
        name: attachment.file.name,
        value: attachment.file.id,
        rawData: attachment
      });
    });
  }

  onFileUploadClick(): void {
    this.showUploadDialog = true;
  }

  onSubmit(): void {}

  onCancel(): void {
    this.router.navigate(['execution/funds-update']);
  }

  swapGrids(): void {
    this.fromRows.forEach(el => {
      el.actions = { ...this.actionState.VIEW };
    });

    this.toRows.forEach(el => {
      el.amount = null;
      el.actions = null;
    });

    const tempRows = this.fromRows;
    this.fromRows = this.toRows;
    this.toRows = tempRows;
    this.fromGridApi.setRowData(this.toRows);
    this.toGridApi.setRowData(this.fromRows);
  }

  onRowAdd(params: any): void {
    if (this.currentToRowDataState.isEditMode) return;
    this.currentToRowDataState.isAddMode = true;

    const el = new ExecutionLine();
    el.actions = this.actionState.EDIT;
    this.toRows.push(el);

    this.editRow(this.toRows.length - 1);
  }

  private starEditMode(rowIndex: number): void {
    this.currentToRowDataState.currentEditingRowIndex = rowIndex;
    this.currentToRowDataState.isEditMode = true;
    this.toRows[rowIndex].actions = { ...this.actionState.EDIT };
    this.toRows.forEach((row, index) => {
      if (rowIndex !== index) {
        row.isDisabled = true;
      }
    });
    this.toGridApi.setRowData(this.toRows);
    this.toGridApi.startEditingCell({
      rowIndex,
      colKey: 'executionLine'
    });
  }

  onCellAction(cellAction: DataGridMessage): void {
    switch (cellAction.message) {
      case 'cancel':
        this.cancelEdit(cellAction.rowIndex);
        break;
    }
  }

  private editRow(rowIndex: number, updatePreviousState?: boolean) {
    if (updatePreviousState) {
      this.currentToRowDataState.currentEditingRowData = { ...this.toRows[rowIndex] };
    }
    this.starEditMode(rowIndex);
  }

  private cancelEdit(rowIndex: number) {
    if (this.currentToRowDataState.isAddMode) {
      this.toRows.splice(rowIndex, 1);
    } else {
      this.toRows[rowIndex] = this.currentToRowDataState.currentEditingRowData;
    }
    this.startViewMode(rowIndex);
  }

  private startViewMode(rowIndex: number) {
    this.currentToRowDataState.currentEditingRowIndex = -1;
    this.currentToRowDataState.isEditMode = false;
    this.currentToRowDataState.isAddMode = false;

    this.toRows.forEach((row: ExecutionLine, index) => {
      row.isDisabled = false;
    });
    this.toGridApi.stopEditing();
    this.toGridApi.setRowData(this.toRows);
  }

  onToGridMouseDown(mouseEvent: MouseEvent): void {
    if (this.currentToRowDataState.isEditMode) {
      this.toGridApi.startEditingCell({
        rowIndex: this.currentToRowDataState.currentEditingRowIndex,
        colKey: 'executionLine'
      });
    }
  }
}

export interface RowDataStateInterface {
  currentEditingRowIndex?: number;
  isAddMode?: boolean;
  isEditMode?: boolean;
  currentEditingRowData?: any;
}
