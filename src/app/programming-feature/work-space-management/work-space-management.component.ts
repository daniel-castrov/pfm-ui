import { Component, OnInit } from '@angular/core';
import { FormatterUtil } from 'src/app/util/formatterUtil';
import { GridApi, ColDef } from '@ag-grid-community/all-modules';
import { formatDate } from '@angular/common';
import { WkspActionCellRendererComponent } from 'src/app/pfm-coreui/datagrid/renderers/wksp-action-cell-renderer/wksp-action-cell-renderer.component';
import { CheckboxCellRendererComponent } from 'src/app/pfm-coreui/datagrid/renderers/checkbox-cell-renderer/checkbox-cell-renderer.component';
import { DataGridMessage } from 'src/app/pfm-coreui/models/DataGridMessage';

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
      canViewFundingLine: true,
      canDuplicate: true,
      disabled: false
    },
    EDIT: {
      canEdit: false,
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

  constructor() {}

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
        cellClass: 'numeric-class',
        cellStyle,
        maxWidth: 80
      },
      {
        headerName: 'Workspace Name',
        field: 'name',
        editable: true,
        suppressMovable: true,
        filter: false,
        sortable: false,
        suppressMenu: true,
        cellClass: 'text-class',
        cellStyle
      },
      {
        headerName: 'Active',
        field: 'active',
        editable: true,
        suppressMovable: true,
        filter: false,
        sortable: false,
        suppressMenu: true,
        cellClass: 'text-center',
        cellStyle,
        maxWidth: 80,
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
        cellClass: 'text-class',
        cellStyle
      },
      {
        headerName: 'Created Date',
        field: 'createdDate',
        editable: false,
        suppressMovable: true,
        filter: false,
        sortable: false,
        suppressMenu: true,
        cellClass: 'text-class',
        cellStyle
      },
      {
        headerName: 'Last Updated Date',
        field: 'lastUpdatedDate',
        editable: false,
        suppressMovable: true,
        filter: false,
        sortable: false,
        suppressMenu: true,
        cellClass: 'text-class',
        cellStyle
      },
      {
        headerName: 'Last Updated By',
        field: 'lastUpdatedBy',
        editable: false,
        suppressMovable: true,
        filter: false,
        sortable: false,
        suppressMenu: true,
        cellClass: 'text-class',
        cellStyle
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
        maxWidth: 130
      }
    ];
  }

  private loadRows() {
    this.rows = [
      {
        version: 1,
        name: 'POM22Workspace',
        active: this.checkboxConfig.inactive,
        notes: '',
        createdDate: formatDate(new Date('2020-04-12 10:00'), 'M/d/yyyy HH:mm', 'en-US'),
        lastUpdatedDate: formatDate(new Date('2020-04-12 10:00'), 'M/d/yyyy HH:mm', 'en-US'),
        lastUpdatedBy: 'Mary Smith',
        action: this.gridActionState.VIEW,
        disabled: false
      }
    ];
  }

  duplicateWorkspace(params) {
    if (this.currentWorkspaceRowDataState.isEditMode) {
      return;
    }
    this.gridActionState.VIEW.disabled = true;
    this.currentWorkspaceRowDataState.isEditMode = true;
    this.rows.push({
      version: this.rows.length + 1,
      name: params.name,
      active: this.checkboxConfig.active,
      notes: '',
      createdDate: '',
      lastUpdatedDate: '',
      lastUpdatedBy: '',
      action: this.gridActionState.EDIT,
      disabled: false
    });
    this.gridApi.setRowData(this.rows);
    this.starEditMode(this.rows.length - 1);
  }

  private starEditMode(rowIndex: number) {
    this.gridApi.startEditingCell({
      rowIndex,
      colKey: 'name'
    });
    this.currentWorkspaceRowDataState.currentEditingRowIndex = rowIndex;
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
    this.rows.splice(-1, 1);
    this.gridApi.stopEditing();
    this.startViewMode();
  }

  private startViewMode() {
    this.currentWorkspaceRowDataState.currentEditingRowIndex = 0;
    this.currentWorkspaceRowDataState.isEditMode = false;
    this.gridApi.stopEditing();
    this.gridApi.setRowData(this.rows);
    this.gridActionState.VIEW.disabled = false;
  }

  handleCellAction(cellAction: DataGridMessage): void {
    switch (cellAction.message) {
      case 'save':
        break;
      case 'edit':
        break;
      case 'duplicate':
        this.duplicateWorkspace(cellAction.rowData);
        break;
      case 'cancel':
        this.cancelEdit();
        break;
    }
  }
  compareVersion() {}
}

export interface RowDataStateInterface {
  currentEditingRowIndex?: number;
  isEditMode?: boolean;
  currentEditingRowData?: any;
}
