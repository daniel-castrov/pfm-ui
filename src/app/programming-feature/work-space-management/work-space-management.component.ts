import { Component, OnInit } from '@angular/core';
import { FormatterUtil } from 'src/app/util/formatterUtil';
import { ColDef, GridApi } from '@ag-grid-community/all-modules';
import { formatDate } from '@angular/common';
import { WkspActionCellRendererComponent } from 'src/app/pfm-coreui/datagrid/renderers/wksp-action-cell-renderer/wksp-action-cell-renderer.component';
import { CheckboxCellRendererComponent } from 'src/app/pfm-coreui/datagrid/renderers/checkbox-cell-renderer/checkbox-cell-renderer.component';
import { DataGridMessage } from 'src/app/pfm-coreui/models/DataGridMessage';
import { DialogService } from 'src/app/pfm-coreui/services/dialog.service';
import { AppModel } from 'src/app/pfm-common-models/AppModel';
import { WorkspaceService } from '../services/workspace.service';
import { PomService } from '../services/pom-service';
import { Pom } from '../models/Pom';
import { RoleConstants } from 'src/app/pfm-common-models/role-contants.model';
import * as moment from 'moment';
import { Router } from '@angular/router';
import { Workspace } from '../models/workspace';

@Component({
  selector: 'pfm-programming',
  templateUrl: './work-space-management.component.html',
  styleUrls: ['./work-space-management.component.scss']
})
export class WorkSpaceManagementComponent implements OnInit {
  byYear: number;
  rows: any[] = [];
  columnDefinitions: ColDef[];
  gridApi: GridApi;
  currentWorkspaceRowDataState: RowDataStateInterface = {};
  pom: Pom;
  gridActionState = {
    VIEW: {
      canView: true,
      canUpdate: true,
      canDuplicate: true,
      disabled: false
    },
    DUPLICATE_ONLY: {
      canView: false,
      canUpdate: false,
      canDuplicate: true,
      disabled: false
    },
    EDIT: {
      canUpdate: false,
      canSave: true,
      disabled: false
    },
    NO_ACTIONS: {
      canView: false,
      canUpdate: false,
      canDuplicate: false,
      disabled: false
    },
    VIEW_ONLY: {
      canView: true,
      canUpdate: false,
      canDuplicate: false,
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

  constructor(
    private dialogService: DialogService,
    private appModel: AppModel,
    private workspaceService: WorkspaceService,
    private pomService: PomService,
    private router: Router
  ) {}

  ngOnInit() {
    this.byYear = FormatterUtil.getCurrentFiscalYear() + 2;
    this.setupGrid();
    this.pomService.getLatestPom().subscribe(
      resp => {
        this.pom = (resp as any).result;
        this.loadRows();
      },
      error => {
        this.dialogService.displayDebug(error);
      }
    );
  }

  onGridIsReady(gridApi: GridApi) {
    this.gridApi = gridApi;
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
        autoHeight: true,
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
          const disableState = params.data.active.disabled;
          params.data.active = { ...(params.newValue ? this.checkboxConfig.active : this.checkboxConfig.inactive) };
          params.data.active.disabled = disableState;
          return true;
        }
      },
      {
        headerName: 'Notes',
        field: 'notes',
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
        field: 'created',
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
        field: 'modified',
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
        field: 'fullNameModifiedBy',
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
        autoHeight: true,
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
        minWidth: 130,
        autoHeight: true
      }
    ];
  }

  private loadRows() {
    if (this.pom) {
      this.workspaceService.getByContainerId(this.pom.id).subscribe(resp => {
        const wskpWalues = (resp as any).result;
        this.rows = [];
        for (const wkspValue of wskpWalues) {
          const workspace = wkspValue;
          workspace.created = formatDate(workspace.created, 'M/d/yyyy HH:mm', 'en-US');
          workspace.modified = formatDate(workspace.modified, 'M/d/yyyy HH:mm', 'en-US');
          workspace.fullNameModifiedBy = wkspValue.fullNameModifiedBy;
          const currentRow = {
            ...workspace,
            action: {
              ...this.getAction(workspace)
            },
            disabled: false
          };
          currentRow.active = { ...(workspace.active ? this.checkboxConfig.active : this.checkboxConfig.inactive) };
          this.rows.push(currentRow);
        }
      });
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
      id: params.id,
      version: null,
      name: params.name,
      active: { ...this.checkboxConfig.active },
      notes: null,
      createdDate: null,
      lastUpdatedDate: null,
      lastUpdatedBy: null,
      action: this.gridActionState.EDIT,
      disabled: false,
      phaseType: params.phaseType
    });
    this.rows[this.rows.length - 1].active.disabled = false;
    this.gridApi.setRowData(this.rows);
    this.starEditMode(this.rows.length - 1);
  }

  saveRow(rowIndex: number) {
    this.gridApi.stopEditing();
    let newRow = this.rows[rowIndex];
    if (this.validateRow(newRow)) {
      newRow.action = this.gridActionState.VIEW;
      if (this.currentWorkspaceRowDataState.isDuplicateMode) {
        const newWorkspace = { ...newRow };
        newWorkspace.active = newRow.active.checked;
        this.workspaceService.duplicate(newWorkspace).subscribe(
          resp => {
            const wkspValue = (resp as any).result;
            const workspace = wkspValue;
            workspace.created = formatDate(workspace.created, 'M/d/yyyy HH:mm', 'en-US');
            workspace.modified = formatDate(workspace.modified, 'M/d/yyyy HH:mm', 'en-US');
            workspace.fullNameModifiedBy = wkspValue.fullNameModifiedBy;
            workspace.active = { ...(workspace.active ? this.checkboxConfig.active : this.checkboxConfig.inactive) };
            newRow = {
              ...workspace,
              action: {
                ...this.getAction(workspace)
              },
              disabled: false
            };
            this.rows[rowIndex] = newRow;
            this.gridApi.setRowData(this.rows);
          },
          error => {
            this.dialogService.displayError(error.error.error);
          }
        );
      } else {
        const newWorkspace = { ...newRow };
        newWorkspace.active = newRow.active.checked;
        newWorkspace.created = moment(newWorkspace.created, 'M/d/yyyy HH:mm', 'en-US');
        newWorkspace.modified = null;
        this.workspaceService.updateWorkspace(newWorkspace).subscribe(
          resp => {
            const wkspValue = (resp as any).result;
            const workspace = wkspValue;
            workspace.created = formatDate(workspace.created, 'M/d/yyyy HH:mm', 'en-US');
            workspace.modified = formatDate(workspace.modified, 'M/d/yyyy HH:mm', 'en-US');
            workspace.fullNameModifiedBy = wkspValue.fullNameModifiedBy;
            workspace.active = { ...(workspace.active ? this.checkboxConfig.active : this.checkboxConfig.inactive) };
            newRow = {
              ...workspace,
              action: {
                ...this.getAction(workspace)
              },
              disabled: false
            };
            this.rows[rowIndex] = newRow;
            this.gridApi.setRowData(this.rows);
          },
          error => {
            this.dialogService.displayDebug(error);
          }
        );
      }
      this.startViewMode();
    } else {
      this.starEditMode(rowIndex);
    }
  }

  viewWorkspace(params) {
    this.router.navigate(['/programming/requests/' + params['id']]);
  }

  private getAction(workspace: Workspace) {
    if (this.appModel.userDetails.roles.includes(RoleConstants.POM_MANAGER)) {
      if (workspace.version === 1) {
        return this.gridActionState.DUPLICATE_ONLY;
      } else {
        return this.gridActionState.VIEW;
      }
    } else {
      if (workspace.version === 1) {
        return this.gridActionState.NO_ACTIONS;
      } else {
        return this.gridActionState.VIEW_ONLY;
      }
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
      case 'view':
        this.viewWorkspace(cellAction.rowData);
        break;
    }
  }

  onColumnResized(params) {
    params.api.resetRowHeights();
  }

  compareVersion() {
    this.router.navigate(['/programming/compare-work-spaces']);
  }
}

export interface RowDataStateInterface {
  currentEditingRowIndex?: number;
  isEditMode?: boolean;
  isDuplicateMode?: boolean;
  currentEditingRowData?: any;
}
