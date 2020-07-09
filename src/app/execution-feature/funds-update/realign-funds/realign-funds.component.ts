import { Component, OnInit, ViewChild } from '@angular/core';
import { FileMetaData } from 'src/app/pfm-common-models/FileMetaData';
import { ActivatedRoute, Router } from '@angular/router';
import { RestResponse } from 'src/app/util/rest-response';
import { ListItem } from 'src/app/pfm-common-models/ListItem';
import { getListItems } from '../../models/enumerations/execution-btr-subtype.model';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { GridApi, ColDef, ICellEditorComp } from '@ag-grid-community/all-modules';
import { ExecutionLine } from '../../models/execution-line.model';
import { Execution } from '../../models/execution.model';
import { ExecutionLineService } from '../../services/execution-line.service';
import { SecureDownloadComponent } from 'src/app/pfm-secure-filedownload/secure-download/secure-download.component';
import { CurrencyPipe } from '@angular/common';
import { ActionCellRendererComponent } from 'src/app/pfm-coreui/datagrid/renderers/action-cell-renderer/action-cell-renderer.component';
import { DropdownCellRendererComponent } from 'src/app/pfm-coreui/datagrid/renderers/dropdown-cell-renderer/dropdown-cell-renderer.component';
import { NumericCellEditor } from 'src/app/ag-grid/cell-editors/NumericCellEditor';
import { AllowedCharacters } from 'src/app/ag-grid/cell-editors/AllowedCharacters';
import { DataGridMessage } from 'src/app/pfm-coreui/models/DataGridMessage';
import { Attachment } from 'src/app/pfm-common-models/Attachment';
import { ExecutionService } from '../../services/execution.service';
import { tap } from 'rxjs/operators';
import { DialogService } from 'src/app/pfm-coreui/services/dialog.service';

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
  executionLinesToRealign: ExecutionLine[] = [];
  deleteDialog: DeleteDialogInterface = { title: 'Delete' };
  swap: boolean;

  constructor(
    private route: ActivatedRoute,
    private executionLineService: ExecutionLineService,
    private executionService: ExecutionService,
    private currencyPipe: CurrencyPipe,
    private router: Router,
    private dialogService: DialogService
  ) {}

  ngOnInit(): void {
    history.state.type = 'BTR'; // TODO delete this

    if (history.state.type) {
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
        cellClass: 'pfm-datagrid-text',
        valueFormatter: params => {
          if (params.value) {
            const find = this.executionLinesToRealign.find(x => x.id === params.value);
            if (find) {
              return find.executionLine;
            } else {
              return params.value;
            }
          }
          return null;
        }
      },
      {
        headerName: `PB${this.executionYearTwoDigits}`,
        field: 'initial',
        editable: false,
        suppressMovable: true,
        filter: false,
        sortable: false,
        suppressMenu: true,
        cellClass: 'justify-content-center',
        cellStyle: this.cellStyle,
        maxWidth: 150,
        minWidth: 150,
        valueFormatter: params =>
          this.currencyPipe.transform(params.data[params.colDef.field], 'USD', 'symbol', '1.2-2')
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
        maxWidth: 150,
        minWidth: 150,
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
        maxWidth: 150,
        minWidth: 150,
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
        valueFormatter: params => {
          if (params.value) {
            const find = this.executionLinesToRealign.find(x => x.id === params.value);
            if (find) {
              return find.executionLine;
            } else {
              return params.value;
            }
          }
          return null;
        },
        cellEditorFramework: DropdownCellRendererComponent,
        cellEditorParams: params => {
          // It also includes the current selected which should not be filtered out.
          const toBeFilteredOut = [...this.toRows, ...this.fromRows];
          return {
            values: this.executionLinesToRealign
              .filter(exe => !toBeFilteredOut.find(e => exe.id === e.id && e.id !== params.value))
              .map(exe => {
                exe.executionLine = this.getExecutionLineName(exe);
                return [exe.executionLine, exe.id];
              })
          };
        }
      },
      {
        headerName: `PB${this.executionYearTwoDigits}`,
        field: 'initial',
        editable: false,
        suppressMovable: true,
        filter: false,
        sortable: false,
        suppressMenu: true,
        cellClass: 'justify-content-center',
        cellStyle: this.cellStyle,
        maxWidth: 150,
        minWidth: 150,
        valueFormatter: params =>
          this.currencyPipe.transform(params.data[params.colDef.field], 'USD', 'symbol', '1.2-2')
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
        maxWidth: 150,
        minWidth: 150,
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
        maxWidth: 150,
        minWidth: 150,
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
        valueFormatter: params => {
          if (params.data.isTotalRow) {
            return 'Total';
          } else {
            return this.currencyPipe.transform(params.data[params.colDef.field], 'USD', 'symbol', '1.2-2');
          }
        }
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
          allowedCharacters: AllowedCharacters.DIGITS_AND_DECIMAL_POINT
        }),
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
        maxWidth: 100,
        minWidth: 100,
        cellRendererFramework: ActionCellRendererComponent
      }
    ];
  }

  loadFromRows(): void {
    const executionLineId = this.route.snapshot.paramMap.get('id');
    this.executionLineService
      .getById(executionLineId)
      .pipe(
        // Get all the Execution line with the same containerId and PE
        tap((resp: RestResponse<ExecutionLine>) => {
          const el = resp.result;
          this.executionLineService
            .getByContainerId(el.containerId, null, null, null, null, el.programElement)
            .subscribe((elResp: RestResponse<ExecutionLine[]>) => {
              const exes = elResp.result ?? [];
              if (exes.length) {
                this.executionLinesToRealign = exes;
              }
            });
        }),
        // Get the execution
        tap((elResp: RestResponse<ExecutionLine>) => {
          this.executionService.getById(elResp.result.containerId).subscribe((exeResp: RestResponse<Execution>) => {
            this.executionYearTwoDigits = exeResp.result.fy.toString().substr(2, 4);
            this.title =
              history.state.type === 'BTR'
                ? `BTR Update for Execution FY${this.executionYearTwoDigits}`
                : `Update for Execution FY${this.executionYearTwoDigits}`;
            console.log('title', this.title);
          });
        })
      )
      .subscribe((resp: RestResponse<ExecutionLine>) => {
        this.selectedExecutionLine = resp.result;
        this.selectedExecutionLine.executionLine = this.getExecutionLineName(this.selectedExecutionLine);
        this.fromRows = [this.selectedExecutionLine];
        this.fromGridApi.setRowData(this.fromRows);
      });
  }

  loadToRows(): void {
    this.toGridApi.setRowData(this.toRows);
  }

  onFromGridIsReady(gridApi: GridApi): void {
    this.fromGridApi = gridApi;
    this.loadFromRows();
  }

  onToGridIsReady(gridApi: GridApi): void {
    this.toGridApi = gridApi;
    this.loadToRows();
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
    this.swap = !this.swap;
  }

  onRowAdd(params: any): void {
    if (this.currentToRowDataState.isEditMode) return;
    this.currentToRowDataState.isAddMode = true;

    const el = new ExecutionLine();
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
      case 'save':
        this.saveRowLocally(cellAction.rowIndex);
        break;
      case 'edit':
        this.editRow(cellAction.rowIndex, true);
        break;
      case 'delete-row':
        this.deleteDialog.bodyText = 'Are you sure you want to delete?';
        this.displayDeleteDialog(cellAction, this.deleteRow.bind(this));
        break;
    }
  }

  private editRow(rowIndex: number, updatePreviousState?: boolean) {
    const el = this.toRows[rowIndex];
    if (updatePreviousState) {
      this.currentToRowDataState.currentEditingRowData = { ...el };
    }
    el.actions = this.actionState.EDIT;
    this.starEditMode(rowIndex);
    this.setupExecutionLineDependency(rowIndex);
  }

  private cancelEdit(rowIndex: number) {
    if (this.currentToRowDataState.isAddMode) {
      this.toRows.splice(rowIndex, 1);
    } else {
      this.toRows[rowIndex] = this.currentToRowDataState.currentEditingRowData;
    }
    this.startViewMode();
    this.toGridApi.setRowData(this.toRows);
  }

  private startViewMode() {
    this.currentToRowDataState.currentEditingRowIndex = -1;
    this.currentToRowDataState.isEditMode = false;
    this.currentToRowDataState.isAddMode = false;

    this.toRows.forEach((row: ExecutionLine, index) => {
      row.isDisabled = false;
    });
    this.toGridApi.stopEditing();
  }

  onToGridMouseDown(mouseEvent: MouseEvent): void {
    if (this.currentToRowDataState.isEditMode) {
      this.toGridApi.startEditingCell({
        rowIndex: this.currentToRowDataState.currentEditingRowIndex,
        colKey: 'executionLine'
      });
    }
  }

  saveRowLocally(rowIndex: number) {
    this.toGridApi.stopEditing();
    const newEl: ExecutionLine = this.toRows[rowIndex];
    if (this.validateRow(newEl)) {
      newEl.actions = this.actionState.VIEW;
      this.toGridApi.setRowData(this.toRows);
      this.setTotalRow();
      this.startViewMode();
    } else {
      this.starEditMode(rowIndex);
    }
  }

  private deleteRow(rowIndex: number) {
    this.toRows.splice(rowIndex, 1);
    this.setTotalRow();
    this.toGridApi.setRowData(this.toRows);
  }

  private validateRow(el: ExecutionLine) {
    if (!el.executionLine) {
      this.dialogService.displayError('Please select an execution line.');
      return false;
    }

    if (!Number(el.amount)) {
      this.dialogService.displayError('The Amount cannot be empty or 0.');
      return false;
    }

    if (Number(el.amount) > Number(el.released ?? 0)) {
      this.dialogService.displayError('Amount cannot exceed the released amount.');
      return false;
    }

    return true;
  }

  private getExecutionLineName(executionLine: ExecutionLine): string {
    let elName = '';
    elName =
      executionLine.programName +
      '/' +
      executionLine.appropriation +
      '/' +
      executionLine.baOrBlin +
      '/' +
      executionLine.item +
      '/' +
      executionLine.programElement;

    return elName;
  }

  setupExecutionLineDependency(rowIndex: number) {
    const elCell = this.toGridApi.getEditingCells()[0];

    const elCellEditor = this.toGridApi.getCellEditorInstances({
      columns: [elCell.column]
    })[0] as ICellEditorComp;

    const elDropdownComponent: DropdownCellRendererComponent = elCellEditor.getFrameworkComponentInstance();
    if (elDropdownComponent) {
      elDropdownComponent.change.subscribe(() => {
        const elId = elDropdownComponent.selectedValue;
        const el = this.executionLinesToRealign.find(exeLine => exeLine.id === elId);
        if (el) {
          const editingExeLine = this.toRows[rowIndex];
          editingExeLine.initial = el.initial;
          editingExeLine.toa = el.toa;
          editingExeLine.released = el.released;
          editingExeLine.withheld = el.withheld;
          editingExeLine.id = elId;
          editingExeLine.executionLine = this.getExecutionLineName(el);
          this.toGridApi.setRowData(this.toRows);
          this.editRow(rowIndex);
        }
      });
    }
  }

  private displayDeleteDialog(cellAction: DataGridMessage, deleteFunction: (rowIndex: number) => void) {
    this.deleteDialog.cellAction = cellAction;
    this.deleteDialog.delete = deleteFunction;
    this.deleteDialog.display = true;
  }

  onCancelDeleteDialog() {
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
  }

  private calculateTotalAmount(): ExecutionLine {
    let totalRow = new ExecutionLine();
    totalRow.amount = 0;
    totalRow.isTotalRow = true;
    totalRow = this.toRows.reduce((accumulator, currentValue) => {
      accumulator.amount += Number(currentValue.amount);
      return accumulator;
    }, totalRow);
    return totalRow;
  }

  private setTotalRow(): void {
    if (this.toRows.length) {
      this.toGridApi.setPinnedBottomRowData([this.calculateTotalAmount()]);
    } else {
      this.toGridApi.setPinnedBottomRowData([]);
    }
  }
}

export interface RowDataStateInterface {
  currentEditingRowIndex?: number;
  isAddMode?: boolean;
  isEditMode?: boolean;
  currentEditingRowData?: any;
}

export interface DeleteDialogInterface {
  title: string;
  bodyText?: string;
  display?: boolean;
  cellAction?: DataGridMessage;
  delete?: (rowIndex: number) => void;
}
