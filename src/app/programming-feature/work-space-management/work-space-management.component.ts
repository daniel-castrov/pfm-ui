import { Component, OnInit } from '@angular/core';
import { FormatterUtil } from 'src/app/util/formatterUtil';
import { GridApi, ColDef } from '@ag-grid-community/all-modules';
import { formatDate } from '@angular/common';
import { WkspActionCellRendererComponent } from 'src/app/pfm-coreui/datagrid/renderers/wksp-action-cell-renderer/wksp-action-cell-renderer.component';
import { CheckboxCellRendererComponent } from 'src/app/pfm-coreui/datagrid/renderers/checkbox-cell-renderer/checkbox-cell-renderer.component';
import { DataGridMessage } from 'src/app/pfm-coreui/models/DataGridMessage';
import { DialogService } from 'src/app/pfm-coreui/services/dialog.service';
import { AppModel } from 'src/app/pfm-common-models/AppModel';

@Component({
  selector: 'pfm-programming',
  templateUrl: './work-space-management.component.html',
  styleUrls: ['./work-space-management.component.scss']
})
export class WorkSpaceManagementComponent implements OnInit {
  byYear: number;
  rows: any;
  columnDefinitions: ColDef[];
  gridApi: GridApi;
  currentWorkspaceRowDataState: RowDataStateInterface = {};
  gridActionState = {
    VIEW: {
      canView: true,
      canUpdate: true,
      canDuplicate: true,
      disabled: false
    },
    VIEW_NO_EDIT: {
      canView: true,
      canUpdate: false,
      canDuplicate: true,
      disabled: false
    },
    EDIT: {
      canUpdate: false,
      canSave: true,
      disabled: false
    }
  };
  checkboxConfig = {
    active: {
      checked: true,
      label: '',
      fieldName: 'status',
      disabled: true
    },
    inactive: {
      checked: false,
      label: '',
      fieldName: 'status',
      disabled: true
    }
  };

  constructor(private dialogService: DialogService, private appModel: AppModel) {}

  ngOnInit() {
    this.byYear = FormatterUtil.getCurrentFiscalYear() + 2;
    this.rows = [];
    this.setupGrid();
  }

  onGridIsReady(gridApi: GridApi) {
    this.gridApi = gridApi;
    this.loadRows();
  }

  private setupGrid() {
    const cellStyle = { display: 'flex', 'align-items': 'center', 'white-space': 'normal' };
    this.columnDefinitions = [
      {
        headerName: 'Version',
        field: 'version',
        editable: false,
        suppressMovable: true,
        filter: false,
        sortable: false,
        suppressMenu: true,
        cellClass: params => {
          return [
            'numeric-class',
            this.currentWorkspaceRowDataState.currentEditingRowIndex === params.rowIndex &&
            this.currentWorkspaceRowDataState.isEditMode
              ? 'non-editable-cell'
              : ''
          ];
        },
        cellStyle,
        maxWidth: 80,
        minWidth: 80
      },
      {
        headerName: 'Workspace Name',
        field: 'name',
        editable: true,
        suppressMovable: true,
        filter: false,
        sortable: false,
        suppressMenu: true,
        cellClass: params => {
          return [
            'text-class',
            this.currentWorkspaceRowDataState.currentEditingRowIndex === params.rowIndex &&
            this.currentWorkspaceRowDataState.isEditMode
              ? 'editable-cell'
              : ''
          ];
        },
        cellStyle,
        maxWidth: 200,
        minWidth: 200
      },
      {
        headerName: 'Active',
        field: 'active',
        editable: true,
        suppressMovable: true,
        filter: false,
        sortable: false,
        suppressMenu: true,
        cellClass: params => {
          return [
            'text-center',
            this.currentWorkspaceRowDataState.currentEditingRowIndex === params.rowIndex &&
            this.currentWorkspaceRowDataState.isEditMode
              ? 'editable-cell'
              : ''
          ];
        },
        cellStyle,
        maxWidth: 80,
        minWidth: 80,
        cellRendererFramework: CheckboxCellRendererComponent,
        cellEditorFramework: CheckboxCellRendererComponent,
        valueSetter: params => {
          params.data.active = params.newValue ? this.checkboxConfig.active : this.checkboxConfig.inactive;
          return true;
        }
      },
      {
        headerName: 'Notes',
        field: 'note',
        editable: true,
        suppressMovable: true,
        filter: false,
        sortable: false,
        suppressMenu: true,
        cellClass: params => {
          return [
            'text-class',
            this.currentWorkspaceRowDataState.currentEditingRowIndex === params.rowIndex &&
            this.currentWorkspaceRowDataState.isEditMode
              ? 'editable-cell'
              : ''
          ];
        },
        cellStyle,
        autoHeight: true,
        minWidth: 300
      },
      {
        headerName: 'Created Date',
        field: 'createdDate',
        editable: false,
        suppressMovable: true,
        filter: false,
        sortable: false,
        suppressMenu: true,
        cellClass: params => {
          return [
            'text-class',
            this.currentWorkspaceRowDataState.currentEditingRowIndex === params.rowIndex &&
            this.currentWorkspaceRowDataState.isEditMode
              ? 'non-editable-cell'
              : ''
          ];
        },
        cellStyle,
        maxWidth: 130,
        minWidth: 130
      },
      {
        headerName: 'Last Updated Date',
        field: 'lastUpdatedDate',
        editable: false,
        suppressMovable: true,
        filter: false,
        sortable: false,
        suppressMenu: true,
        cellClass: params => {
          return [
            'text-class',
            this.currentWorkspaceRowDataState.currentEditingRowIndex === params.rowIndex &&
            this.currentWorkspaceRowDataState.isEditMode
              ? 'non-editable-cell'
              : ''
          ];
        },
        cellStyle,
        maxWidth: 140,
        minWidth: 140
      },
      {
        headerName: 'Last Updated By',
        field: 'lastUpdatedBy',
        editable: false,
        suppressMovable: true,
        filter: false,
        sortable: false,
        suppressMenu: true,
        cellClass: params => {
          return [
            'text-class',
            this.currentWorkspaceRowDataState.currentEditingRowIndex === params.rowIndex &&
            this.currentWorkspaceRowDataState.isEditMode
              ? 'non-editable-cell'
              : ''
          ];
        },
        cellStyle,
        maxWidth: 130,
        minWidth: 130
      },
      {
        headerName: 'Actions',
        field: 'action',
        editable: false,
        suppressMovable: true,
        filter: false,
        sortable: false,
        suppressMenu: true,
        cellStyle,
        cellRendererFramework: WkspActionCellRendererComponent,
        maxWidth: 130,
        minWidth: 130
      }
    ];
  }

  private loadRows() {
    if (JSON.parse(sessionStorage.getItem('wkspGridRows'))) {
      this.rows = JSON.parse(sessionStorage.getItem('wkspGridRows'));
    } else {
      this.rows = [
        {
          version: 1,
          name: 'POM22Workspace',
          active: { ...this.checkboxConfig.inactive },
          notes: '',
          createdDate: formatDate(new Date('2020-04-12 10:00'), 'M/d/yyyy HH:mm', 'en-US'),
          lastUpdatedDate: formatDate(new Date('2020-04-12 10:00'), 'M/d/yyyy HH:mm', 'en-US'),
          lastUpdatedBy: 'Mary Smith',
          action: this.gridActionState.VIEW_NO_EDIT, // should have this state if it's not created by the user.
          disabled: false,
          userCreated: false
        }
      ];
      sessionStorage.setItem('wkspGridRows', JSON.stringify(this.rows));
    }
  }

  editWorkSpace(rowIndex: number, updatePreviousState?: boolean) {
    if (updatePreviousState) {
      this.currentWorkspaceRowDataState.currentEditingRowData = { ...this.rows[rowIndex] };
    }
    const editRow = this.rows[rowIndex];
    editRow.action = this.gridActionState.EDIT;
    editRow.active.disabled = false;
    this.starEditMode(rowIndex);
  }

  duplicateWorkspace(params) {
    if (this.currentWorkspaceRowDataState.isEditMode) {
      return;
    }

    this.currentWorkspaceRowDataState.isDuplicateMode = true;
    this.rows.push({
      version: this.rows.length + 1,
      name: params.name,
      active: { ...this.checkboxConfig.active },
      notes: '',
      createdDate: '',
      lastUpdatedDate: '',
      lastUpdatedBy: '',
      action: this.gridActionState.EDIT,
      disabled: false
    });
    this.rows[this.rows.length - 1].active.disabled = false;
    this.gridApi.setRowData(this.rows);
    this.starEditMode(this.rows.length - 1);
  }

  saveRow(rowIndex: number) {
    this.gridApi.stopEditing();
    const newRow = this.rows[rowIndex];
    if (this.validateRow(newRow)) {
      newRow.action = this.gridActionState.VIEW;
      const creactionDate = new Date();
      if (this.currentWorkspaceRowDataState.isDuplicateMode) {
        newRow.createdDate = formatDate(creactionDate, 'M/d/yyyy HH:mm', 'en-US');
        newRow.lastUpdatedDate = formatDate(creactionDate, 'M/d/yyyy HH:mm', 'en-US');
      }
      newRow.lastUpdatedBy = this.appModel.userDetails.fullName;
      this.startViewMode();
      sessionStorage.setItem('wkspGridRows', JSON.stringify(this.rows));
    } else {
      this.starEditMode(rowIndex);
    }
  }

  private validateRow(row) {
    if (!row.name) {
      this.dialogService.displayError('Workspace name cannot be empty');
    }
    return row.name;
  }

  private starEditMode(rowIndex: number) {
    this.currentWorkspaceRowDataState.currentEditingRowIndex = rowIndex;
    this.currentWorkspaceRowDataState.isEditMode = true;
    this.gridApi.setRowData(this.rows);
    this.gridApi.startEditingCell({
      rowIndex,
      colKey: 'name'
    });
    this.rows.forEach((row, index) => {
      if (rowIndex !== index) {
        row.action.disabled = true;
      }
    });
  }

  onMouseDown(mouseEvent: MouseEvent) {
    if (this.currentWorkspaceRowDataState.isEditMode) {
      this.gridApi.startEditingCell({
        rowIndex: this.currentWorkspaceRowDataState.currentEditingRowIndex,
        colKey: 'name'
      });
    }
  }

  private cancelEdit() {
    if (this.currentWorkspaceRowDataState.isDuplicateMode) {
      this.rows.splice(-1, 1);
    } else {
      this.rows[
        this.currentWorkspaceRowDataState.currentEditingRowIndex
      ] = this.currentWorkspaceRowDataState.currentEditingRowData;
    }
    this.gridApi.stopEditing();
    this.startViewMode();
  }

  private startViewMode() {
    this.currentWorkspaceRowDataState.currentEditingRowIndex = -1;
    this.rows.forEach((row, index) => {
      row.action.disabled = false;
      row.active.disabled = true;
    });
    this.currentWorkspaceRowDataState.isEditMode = false;
    this.currentWorkspaceRowDataState.isDuplicateMode = false;
    this.gridApi.stopEditing();
    this.gridApi.setRowData(this.rows);
    this.gridActionState.VIEW.disabled = false;
  }

  handleCellAction(cellAction: DataGridMessage): void {
    switch (cellAction.message) {
      case 'save':
        this.saveRow(cellAction.rowIndex);
        break;
      case 'duplicate':
        this.duplicateWorkspace(cellAction.rowData);
        break;
      case 'edit':
        this.editWorkSpace(cellAction.rowIndex, true);
        break;
      case 'cancel':
        this.cancelEdit();
        break;
    }
  }

  onColumnResized(params) {
    params.api.resetRowHeights();
  }

  compareVersion() {}
}

export interface RowDataStateInterface {
  currentEditingRowIndex?: number;
  isEditMode?: boolean;
  isDuplicateMode?: boolean;
  currentEditingRowData?: any;
}
