import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { ListItem } from '../../pfm-common-models/ListItem';
import { ExecutionService } from '../services/execution.service';
import { ColDef, GridApi } from '@ag-grid-community/all-modules';
import { ExecutionLineService } from '../services/execution-line.service';
import { IExecutionLine } from '../models/execution-line.model';
import { RestResponse } from 'src/app/util/rest-response';
import { BasicRowDataStateInterface } from 'src/app/pfm-coreui/datagrid/model/basic-row-data-state.model';
import { BasicActionState } from 'src/app/pfm-coreui/datagrid/model/basic-action-state.model';
import { DataGridMessage } from 'src/app/pfm-coreui/models/DataGridMessage';
import { DialogService } from 'src/app/pfm-coreui/services/dialog.service';
import { DropdownCellRendererComponent } from 'src/app/pfm-coreui/datagrid/renderers/dropdown-cell-renderer/dropdown-cell-renderer.component';
import { CurrencyPipe } from '@angular/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { IExecutionLineGrid } from '../models/execution-line-grid.model';
import { PropertyService } from 'src/app/programming-feature/services/property.service';
import { PropertyType } from 'src/app/programming-feature/models/enumerations/property-type.model';
import { IExecution } from '../models/execution.model';
import { FundsUpdateActionCellRendererComponent } from '../../pfm-coreui/datagrid/renderers/funds-update-action-cell-renderer/funds-update-action-cell-renderer.component';
import { AppModel } from 'src/app/pfm-common-models/AppModel';
import { RoleConstants } from 'src/app/pfm-common-models/role-contants.model';

@Component({
  selector: 'app-funds-update',
  templateUrl: './funds-update.component.html',
  styleUrls: ['./funds-update.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class FundsUpdateComponent implements OnInit {
  years: ListItem[];
  columnDefs: ColDef[];
  selectedYear: number;
  executions: IExecution[];
  selectedExecution: IExecution;
  rows = [];

  appnOptions = [];
  allBaBlins = [];
  baOptions = [];
  sagOptions = [];
  wucdOptions = [];
  expTypeOptions = [];
  opAgencyOptions = [];
  programElementOptions = [];
  actionsControl: {};

  executionLineGridApi: GridApi;
  executionLineRows: IExecutionLineGrid[] = [];
  executionLineRowDataState: BasicRowDataStateInterface = {};

  deleteDialog: DeleteDialogInterface = { title: 'Delete' };

  constructor(
    private executionService: ExecutionService,
    private executionLineService: ExecutionLineService,
    private dialogService: DialogService,
    private propertyService: PropertyService,
    private currencyPipe: CurrencyPipe,
    private appModel: AppModel
  ) {}

  ngOnInit(): void {
    this.loadDropDownValues();
    this.executionService.getExecutionYears().subscribe((resp: RestResponse<IExecution[]>) => {
      this.executions = resp.result;
      this.years = this.executions
        .map(e => e.fy)
        .sort()
        .map(year => {
          return {
            id: year.toString(),
            disabled: false,
            isSelected: false,
            name: 'Execution FY' + (year % 100),
            value: 'Execution FY' + (year % 100),
            rawData: year
          } as ListItem;
        });
    });
    this.setupGrid();
    this.actionsRoleAccess();
  }

  actionsRoleAccess() {
    if (this.appModel.userDetails.roles.includes(RoleConstants.FUNDS_MANAGER)) {
      this.actionsControl = BasicActionState.VIEW;
    }
  }

  private loadDropDownValues() {
    this.propertyService.getByType(PropertyType.APPROPRIATION).subscribe((res: any) => {
      this.appnOptions = res.properties.map(x => x.value).map(x => x.appropriation);
    });
    this.propertyService.getByType(PropertyType.BA_BLIN).subscribe((res: any) => {
      this.allBaBlins = res.properties.map(x => x.value);
    });
    this.propertyService.getByType(PropertyType.SAG).subscribe((res: any) => {
      this.sagOptions = res.properties.map(x => x.value).map(x => x.sag);
    });
    this.propertyService.getByType(PropertyType.WORK_UNIT_CODE).subscribe((res: any) => {
      this.wucdOptions = res.properties.map(x => x.value).map(x => x.workUnitCode);
    });
    this.propertyService.getByType(PropertyType.EXPENDITURE_TYPE).subscribe((res: any) => {
      this.expTypeOptions = res.properties.map(x => x.value).map(x => x.code);
    });
    this.propertyService.getByType(PropertyType.OPERATING_AGENCY).subscribe((res: any) => {
      this.opAgencyOptions = res.properties.map(x => x.value).map(x => x.code);
    });
    this.propertyService.getByType(PropertyType.PROGRAM_ELEMENT).subscribe((res: any) => {
      this.programElementOptions = res.properties.map(x => x.value).map(x => x.programElement);
    });
    this.setupGrid();
  }

  private setupGrid() {
    this.columnDefs = [
      {
        minWidth: 30,
        maxWidth: 30,
        headerCheckboxSelection: true,
        checkboxSelection: true
      },
      {
        colId: '0',
        headerName: 'Program',
        field: 'programName',
        editable: true,
        cellClass: 'pfm-datagrid-text',
        minWidth: 50,
        suppressMovable: true,
        filter: false,
        sortable: false,
        suppressMenu: true
      },
      {
        colId: '1',
        headerName: 'APPN',
        field: 'appropriation',
        editable: true,
        cellClass: 'pfm-datagrid-text',
        minWidth: 70,
        suppressMovable: true,
        filter: false,
        sortable: false,
        suppressMenu: true,
        cellEditorFramework: DropdownCellRendererComponent,
        cellEditorParams: params => {
          return {
            values: [...this.appnOptions]
          };
        }
      },
      {
        colId: '2',
        headerName: 'BA/BLIN',
        field: 'baOrBlin',
        editable: true,
        cellClass: 'pfm-datagrid-text',
        minWidth: 70,
        suppressMovable: true,
        filter: false,
        sortable: false,
        suppressMenu: true,
        cellEditorFramework: DropdownCellRendererComponent,
        cellEditorParams: params => {
          return {
            values: [...this.allBaBlins.filter(x => params.data.appropriation === x.appropriation).map(x => x.code)]
          };
        }
      },
      {
        colId: '3',
        headerName: 'SAG',
        field: 'sag',
        editable: true,
        cellClass: 'pfm-datagrid-text',
        minWidth: 70,
        suppressMovable: true,
        filter: false,
        sortable: false,
        suppressMenu: true,
        cellEditorFramework: DropdownCellRendererComponent,
        cellEditorParams: params => {
          return {
            values: [...new Set(this.sagOptions)]
          };
        }
      },
      {
        colId: '4',
        headerName: 'WUCD',
        field: 'wucd',
        editable: true,
        cellClass: 'pfm-datagrid-text',
        minWidth: 70,
        suppressMovable: true,
        filter: false,
        sortable: false,
        suppressMenu: true,
        cellEditorFramework: DropdownCellRendererComponent,
        cellEditorParams: params => {
          return {
            values: [...this.wucdOptions]
          };
        }
      },
      {
        colId: '5',
        headerName: 'EXP Type',
        field: 'expenditureType',
        editable: true,
        cellClass: 'pfm-datagrid-text',
        minWidth: 70,
        suppressMovable: true,
        filter: false,
        sortable: false,
        suppressMenu: true,
        cellEditorFramework: DropdownCellRendererComponent,
        cellEditorParams: params => {
          return {
            values: [...this.expTypeOptions]
          };
        }
      },
      {
        colId: '6',
        headerName: 'OA',
        field: 'opAgency',
        editable: true,
        cellClass: 'pfm-datagrid-text',
        minWidth: 50,
        suppressMovable: true,
        filter: false,
        sortable: false,
        suppressMenu: true,
        cellEditorFramework: DropdownCellRendererComponent,
        cellEditorParams: params => {
          return {
            values: [...this.opAgencyOptions]
          };
        }
      },
      {
        colId: '7',
        headerName: 'PE',
        field: 'programElement',
        editable: true,
        cellClass: 'pfm-datagrid-text',
        minWidth: 70,
        suppressMovable: true,
        filter: false,
        sortable: false,
        suppressMenu: true,
        cellEditorFramework: DropdownCellRendererComponent,
        cellEditorParams: params => {
          return {
            values: [...this.programElementOptions]
          };
        }
      },
      {
        headerName: 'PBxx',
        headerValueGetter: params => (this.selectedYear ? 'PB' + (this.selectedYear % 100) : 'Initial Funds'),
        field: 'pb',
        minWidth: 55,
        cellClass: 'pfm-datagrid-numeric-class',
        suppressMovable: true,
        filter: false,
        sortable: false,
        suppressMenu: true,
        valueFormatter: params =>
          this.currencyPipe.transform(params.data[params.colDef.field], 'USD', 'symbol', '1.2-2')
      },
      {
        headerName: 'TOA',
        field: 'toa',
        minWidth: 70,
        cellClass: 'pfm-datagrid-numeric-class',
        suppressMovable: true,
        filter: false,
        sortable: false,
        suppressMenu: true,
        valueFormatter: params =>
          this.currencyPipe.transform(params.data[params.colDef.field], 'USD', 'symbol', '1.2-2')
      },
      {
        headerName: 'Released',
        field: 'released',
        minWidth: 70,
        cellClass: 'pfm-datagrid-numeric-class',
        suppressMovable: true,
        filter: false,
        sortable: false,
        suppressMenu: true,
        valueFormatter: params =>
          this.currencyPipe.transform(params.data[params.colDef.field], 'USD', 'symbol', '1.2-2')
      },
      {
        headerName: 'Withhold',
        field: 'withhold',
        minWidth: 70,
        cellClass: 'pfm-datagrid-numeric-class',
        suppressMovable: true,
        filter: false,
        sortable: false,
        suppressMenu: true,
        valueFormatter: params =>
          this.currencyPipe.transform(params.data[params.colDef.field], 'USD', 'symbol', '1.2-2')
      },
      {
        headerName: 'Actions',
        field: 'action',
        minWidth: 70,
        cellRendererFramework: FundsUpdateActionCellRendererComponent,
        cellClass: 'text-class',
        suppressMovable: true,
        filter: false,
        sortable: false,
        suppressMenu: true
      }
    ];
  }

  onYearChange(year: any): void {
    this.selectedYear = year ? year.rawData : undefined;
    if (this.selectedYear) {
      this.executionLineService.retrieveByYear(this.selectedYear).subscribe((resp: RestResponse<IExecutionLine[]>) => {
        this.selectedExecution = this.executions.find(execution => execution.fy === this.selectedYear);
        const executionLines = resp.result;
        this.executionLineRows = [];
        executionLines.forEach(executionLine => {
          const row: IExecutionLineGrid = {
            phaseId: this.selectedExecution.id,
            programName: executionLine.programName,
            appropriation: executionLine.appropriation,
            baOrBlin: executionLine.baOrBlin,
            sag: executionLine.sag,
            wucd: executionLine.wucd,
            expenditureType: executionLine.expenditureType,
            opAgency: executionLine.opAgency,
            programElement: executionLine.programElement,
            pb: 0,
            toa: 0,
            released: 0,
            withhold: 0,
            action: { ...BasicActionState.VIEW, canFunds: true }
          };
          this.executionLineRows.push(row);
        });
        this.executionLineGridApi.refreshHeader();
      });
    }
  }

  onExecutionLineGridIsReady(event: GridApi) {
    this.executionLineGridApi = event;
  }

  onExecutionLineRowAdd(event) {
    if (this.executionLineRowDataState.isEditMode) {
      return;
    }
    this.executionLineRows.push({
      phaseId: this.selectedExecution.id,
      programName: null,
      appropriation: null,
      baOrBlin: null,
      sag: null,
      wucd: null,
      expenditureType: null,
      opAgency: null,
      programElement: null,
      pb: 0,
      toa: 0,
      released: 0,
      withhold: 0,
      action: null
    });
    this.executionLineRowDataState.isAddMode = true;
    this.executionLineGridApi.setRowData(this.executionLineRows);
    this.executionLineGridApi.hideOverlay();
    this.editRow(this.executionLineRows.length - 1);
  }

  onExecutionLineCellAction(cellAction: DataGridMessage) {
    switch (cellAction.message) {
      case 'save':
        this.saveRow(cellAction.rowIndex);
        break;
      case 'edit':
        if (!this.executionLineRowDataState.isEditMode) {
          this.editRow(cellAction.rowIndex, true);
        }
        break;
      case 'delete-row':
        if (!this.executionLineRowDataState.isEditMode) {
          this.deleteDialog.bodyText = 'Are you sure you want to delete this row?';
          this.displayDeleteDialog(cellAction, this.deleteRow.bind(this));
        }
        break;
      case 'cancel':
        this.performCancel(cellAction.rowIndex);
        break;
    }
  }

  private saveRow(rowIndex: number) {
    this.executionLineGridApi.stopEditing();
    const canSave = this.validateExecutionLineRowData(rowIndex);
    if (canSave) {
      this.prepareExecutionLineSave(rowIndex);
    } else {
      this.editRow(rowIndex);
    }
  }

  private prepareExecutionLineSave(rowIndex: number) {
    const row = this.executionLineRows[rowIndex];
    const executionLine: IExecutionLine = this.convertExecutionLineGridToExecutionLine(row);
    if (this.executionLineRowDataState.isAddMode) {
      this.performExecutionLineSave(
        this.executionLineService.create.bind(this.executionService),
        executionLine,
        rowIndex
      );
    } else {
      this.performExecutionLineSave(
        this.executionLineService.update.bind(this.executionService),
        executionLine,
        rowIndex
      );
    }
  }

  private performExecutionLineSave(
    saveOrUpdate: (executionLine: IExecutionLine) => Observable<any>,
    executionLine: IExecutionLine,
    rowIndex: number
  ) {
    saveOrUpdate(executionLine)
      .pipe(
        map((resp: RestResponse<IExecutionLine>) => {
          return this.convertExecutionLineToExecutionLineGrid(resp.result);
        })
      )
      .subscribe(
        executionLineGrid => {
          this.executionLineRows[rowIndex] = executionLineGrid;
          this.viewExecutionLineMode(rowIndex);
        },
        error => {
          this.dialogService.displayDebug(error);
          this.editRow(rowIndex);
        }
      );
  }

  private cancelRow(rowIndex: number) {
    this.executionLineRows[rowIndex] = this.executionLineRowDataState.currentEditingRowData;
    this.viewExecutionLineMode(rowIndex);
  }

  private editRow(rowIndex: number, updatePreviousState?: boolean) {
    if (updatePreviousState) {
      this.executionLineRowDataState.currentEditingRowData = { ...this.executionLineRows[rowIndex] };
    }
    this.editExecutionLineMode(rowIndex);
    this.setupAppnDependency();
  }

  private performCancel(rowIndex: number) {
    if (this.executionLineRowDataState.isEditMode && !this.executionLineRowDataState.isAddMode) {
      this.cancelRow(rowIndex);
    } else {
      this.deleteRow(rowIndex);
    }
  }

  private deleteRow(rowIndex: number) {
    const executionLineId = this.executionLineRows[rowIndex].id;
    if (executionLineId) {
      this.executionLineService.removeById(executionLineId).subscribe(
        () => {
          this.performExecutionLineDelete(rowIndex);
        },
        error => {
          this.dialogService.displayDebug(error);
        }
      );
    } else {
      this.performExecutionLineDelete(rowIndex);
    }
  }

  private performExecutionLineDelete(rowIndex: number) {
    this.executionLineRows.splice(rowIndex, 1);
    this.executionLineRowDataState.currentEditingRowIndex = 0;
    this.executionLineRowDataState.isEditMode = false;
    this.executionLineRowDataState.isAddMode = false;
    this.executionLineGridApi.stopEditing();
    this.executionLineRows.forEach(row => {
      row.isDisabled = false;
    });
    this.executionLineGridApi.setRowData(this.executionLineRows);
    this.executionLineGridApi.hideOverlay();
  }

  private viewExecutionLineMode(rowIndex: number) {
    this.executionLineRowDataState.currentEditingRowIndex = -1;
    this.executionLineRowDataState.isEditMode = false;
    this.executionLineRowDataState.isAddMode = false;
    this.executionLineGridApi.stopEditing();

    this.executionLineRows[rowIndex].action = BasicActionState.VIEW;
    this.executionLineRows.forEach(row => {
      row.isDisabled = false;
    });
    this.executionLineGridApi.setRowData(this.executionLineRows);
    this.executionLineGridApi.hideOverlay();
    this.executionLineGridApi.hideOverlay();
  }

  private editExecutionLineMode(rowIndex: number) {
    this.executionLineRowDataState.currentEditingRowIndex = rowIndex;
    this.executionLineRowDataState.isEditMode = true;
    this.executionLineRows[rowIndex].action = BasicActionState.EDIT;
    this.executionLineRows.forEach((row, index) => {
      if (rowIndex !== index) {
        row.isDisabled = true;
      }
    });
    this.executionLineGridApi.setRowData(this.executionLineRows);
    this.executionLineGridApi.hideOverlay();
    this.executionLineGridApi.startEditingCell({
      rowIndex,
      colKey: '0'
    });
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

  private validateExecutionLineRowData(rowIndex: any) {
    const row = this.executionLineRows[rowIndex];
    let errorMessage = '';
    if (!row.appropriation || !row.appropriation?.length || row.appropriation?.toLowerCase() === 'select') {
      errorMessage = 'Please, select an APPN.';
    } else if (!row.baOrBlin || !row.baOrBlin?.length || row.baOrBlin?.toLowerCase() === 'select') {
      errorMessage = 'Please, select a BA/BLIN.';
    } else if (!row.sag || !row.sag?.length || row.sag?.toLowerCase() === 'select') {
      errorMessage = 'Please, select a SAG.';
    } else if (!row.wucd || !row.wucd?.length || row.wucd?.toLowerCase() === 'select') {
      errorMessage = 'Please, select a WUCD.';
    } else if (
      !row.expenditureType ||
      !row.expenditureType?.length ||
      row.expenditureType?.toLowerCase() === 'select'
    ) {
      errorMessage = 'Please, select a EXP Type.';
    }

    if (
      this.executionLineRows.some((executionLine, idx) => {
        return (
          idx !== rowIndex &&
          executionLine.appropriation === row.appropriation &&
          executionLine.baOrBlin === row.baOrBlin &&
          executionLine.sag === row.sag &&
          executionLine.wucd === row.wucd &&
          executionLine.expenditureType === row.expenditureType
        );
      })
    ) {
      errorMessage = 'You have repeated an existing execution line. Please delete this row and edit the existing line.';
    }
    if (errorMessage.length) {
      this.dialogService.displayError(errorMessage);
    }
    return !errorMessage.length;
  }

  setupAppnDependency() {
    const appnCell = this.executionLineGridApi.getEditingCells()[0];
    const baBlinCell = this.executionLineGridApi.getEditingCells()[1];

    const appnCellEditor = this.executionLineGridApi.getCellEditorInstances({
      columns: [appnCell.column]
    })[0] as any;

    const bablinCellEditor = this.executionLineGridApi.getCellEditorInstances({
      columns: [baBlinCell.column]
    })[0] as any;

    const appnDropdownComponent = appnCellEditor._frameworkComponentInstance as DropdownCellRendererComponent;
    if (appnDropdownComponent) {
      const baBlinDropdownComponent = bablinCellEditor._frameworkComponentInstance as DropdownCellRendererComponent;

      appnDropdownComponent.change.subscribe(() => {
        const list = [
          ...this.allBaBlins.filter(x => appnDropdownComponent.selectedValue === x.appropriation).map(x => x.code)
        ];
        baBlinDropdownComponent.updateList(list);
      });
    }
  }

  private convertExecutionLineGridToExecutionLine(executionLineGrid: IExecutionLineGrid): IExecutionLine {
    const converted: IExecutionLine = { ...executionLineGrid };
    return converted;
  }

  private convertExecutionLineToExecutionLineGrid(executionLine: IExecutionLine): IExecutionLineGrid {
    const {
      containerId: phaseId,
      programName,
      appropriation,
      baOrBlin,
      sag,
      wucd,
      expenditureType,
      opAgency,
      programElement
    } = executionLine;
    const converted: IExecutionLineGrid = {
      phaseId,
      programName,
      appropriation,
      baOrBlin,
      sag,
      wucd,
      expenditureType,
      opAgency,
      programElement,
      pb: 0,
      toa: 0,
      released: 0,
      withhold: 0,
      action: { ...BasicActionState.VIEW, canFunds: true }
    };
    return converted;
  }

  onExecutionLineGridMouseDown(mouseEvent: MouseEvent) {
    if (this.executionLineRowDataState.isEditMode) {
      this.executionLineGridApi.startEditingCell({
        rowIndex: this.executionLineRowDataState.currentEditingRowIndex,
        colKey: '0'
      });
      this.setupAppnDependency();
    }
  }
}

export interface DeleteDialogInterface {
  title: string;
  bodyText?: string;
  display?: boolean;
  cellAction?: DataGridMessage;
  delete?: (rowIndex: number) => void;
}
