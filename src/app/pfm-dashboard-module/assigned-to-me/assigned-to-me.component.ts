import { Component, OnDestroy, OnInit } from '@angular/core';
import { DatePickerCellRendererComponent } from '../../pfm-coreui/datagrid/renderers/date-picker-cell-renderer/date-picker-cell-renderer.component';
import { DatePickerCellEditorComponent } from '../../pfm-coreui/datagrid/renderers/date-picker-cell-editor/date-picker-cell-editor.component';
import { ColDef } from '@ag-grid-community/all-modules';
import { GridApi } from 'ag-grid-community';
import { formatDate } from '@angular/common';
import { AppModel } from '../../pfm-common-models/AppModel';
import { AtmActionCellRendererComponent } from '../../pfm-coreui/datagrid/renderers/atm-action-cell-renderer/atm-action-cell-renderer.component';

@Component({
  selector: 'pfm-assigned-to-me',
  templateUrl: './assigned-to-me.component.html',
  styleUrls: ['./assigned-to-me.component.scss']
})
export class AssignedToMeComponent implements OnInit, OnDestroy {
  rows: any;
  columnDefinitions: ColDef[];
  gridApi: GridApi;

  gridActionState = {
    VIEW: {
      canView: true
    },
    LOCKED: {
      canView: false
    }
  };

  constructor(private appModel: AppModel) {}

  ngOnDestroy(): void {}

  ngOnInit(): void {
    this.setupGrid();
  }

  setupGrid() {
    this.columnDefinitions = [
      {
        headerName: 'Created Date',
        field: 'createdDate',
        editable: true,
        suppressMovable: true,
        filter: false,
        sortable: false,
        suppressMenu: true,
        cellClass: 'numeric-class',
        cellStyle: { display: 'flex', 'align-items': 'center', 'white-space': 'normal' }
      },
      {
        headerName: 'Type',
        field: 'type',
        editable: true,
        suppressMovable: true,
        filter: false,
        sortable: false,
        suppressMenu: true,
        cellClass: 'text-class',
        cellStyle: { display: 'flex', 'align-items': 'center', 'white-space': 'normal' }
      },
      {
        headerName: 'Assignment',
        field: 'assignment',
        editable: true,
        suppressMovable: true,
        filter: false,
        sortable: false,
        suppressMenu: true,
        cellClass: 'text-class',
        cellStyle: { display: 'flex', 'align-items': 'center', 'white-space': 'normal' }
      },
      {
        headerName: 'Assigned To',
        field: 'assignedTo',
        editable: true,
        suppressMovable: true,
        filter: false,
        sortable: false,
        suppressMenu: true,
        cellClass: 'text-class',
        cellStyle: { display: 'flex', 'align-items': 'center', 'white-space': 'normal' }
      },
      {
        headerName: 'From',
        field: 'from',
        editable: true,
        suppressMovable: true,
        filter: false,
        sortable: false,
        suppressMenu: true,
        cellClass: 'text-class',
        cellStyle: { display: 'flex', 'align-items': 'center', 'white-space': 'normal' }
      },
      {
        headerName: 'Status',
        field: 'status',
        editable: true,
        suppressMovable: true,
        filter: false,
        sortable: false,
        suppressMenu: true,
        cellClass: 'text-class',
        cellStyle: { display: 'flex', 'align-items': 'center', 'white-space': 'normal' },
        cellRendererFramework: DatePickerCellRendererComponent,
        cellEditorFramework: DatePickerCellEditorComponent
      },
      {
        headerName: 'In Use By',
        field: 'inUseBy',
        editable: true,
        suppressMovable: true,
        filter: false,
        sortable: false,
        suppressMenu: true,
        cellClass: 'text-class',
        cellStyle: { display: 'flex', 'align-items': 'center', 'white-space': 'normal' }
      },
      {
        headerName: 'Last Edited By',
        field: 'lastEditedBy',
        editable: true,
        suppressMovable: true,
        filter: false,
        sortable: false,
        suppressMenu: true,
        cellClass: 'text-class',
        cellStyle: { display: 'flex', 'align-items': 'center', 'white-space': 'normal' }
      },
      {
        headerName: 'Due date',
        field: 'dueDate',
        editable: true,
        suppressMovable: true,
        filter: false,
        sortable: false,
        suppressMenu: true,
        cellClass: 'text-class',
        cellStyle: { display: 'flex', 'align-items': 'center', 'white-space': 'normal' },
        cellRendererFramework: DatePickerCellRendererComponent,
        cellEditorFramework: DatePickerCellEditorComponent
      },
      {
        headerName: 'Actions',
        field: 'action',
        editable: false,
        suppressMovable: true,
        filter: false,
        sortable: false,
        suppressMenu: true,
        cellStyle: { display: 'flex', 'align-items': 'center', 'white-space': 'normal' },
        cellRendererFramework: AtmActionCellRendererComponent,
        maxWidth: 120
      }
    ];
  }

  onGridIsReady(gridApi: GridApi) {
    this.gridApi = gridApi;
    this.gridApi.setRowData([]);
    this.loadRows();
  }

  private loadRows() {
    this.rows = [
      {
        createdDate: formatDate(new Date('2020-04-09'), 'MM/dd/yyyy h:mm', 'en-US'),
        type: 'PR',
        assignment: 'BPS',
        assignedTo: 'Funds Requestor',
        from: 'POM Manager',
        status: 'In progress',
        inUseBy: '',
        lastEditedBy: 'Ken Bradley',
        dueDate: formatDate(new Date('2020-05-11'), 'MM/dd/yyyy h:mm', 'en-US'),
        action: this.gridActionState.VIEW
      },
      {
        createdDate: formatDate(new Date('2020-04-09'), 'MM/dd/yyyy h:mm', 'en-US'),
        type: 'PR',
        assignment: 'CRT',
        assignedTo: 'Funds Requestor',
        from: 'POM Manager',
        status: 'Open',
        inUseBy: '',
        lastEditedBy: '',
        dueDate: formatDate(new Date('2020-05-11'), 'MM/dd/yyyy h:mm', 'en-US'),
        action: this.gridActionState.VIEW
      },
      {
        createdDate: formatDate(new Date('2020-04-09'), 'MM/dd/yyyy h:mm', 'en-US'),
        type: 'PR',
        assignment: 'AV TX',
        assignedTo: 'Funds Requestor',
        from: 'POM Manager',
        status: 'Open',
        inUseBy: '',
        lastEditedBy: '',
        dueDate: formatDate(new Date('2020-05-11'), 'MM/dd/yyyy h:mm', 'en-US'),
        action: this.gridActionState.VIEW
      },
      {
        createdDate: formatDate(new Date('2020-04-09'), 'MM/dd/yyyy h:mm', 'en-US'),
        type: 'PR',
        assignment: 'WMD CST',
        assignedTo: 'Funds Requestor',
        from: 'POM Manager',
        status: 'Open',
        inUseBy: '',
        lastEditedBy: '',
        dueDate: formatDate(new Date('2020-05-11'), 'MM/dd/yyyy h:mm', 'en-US'),
        action: this.gridActionState.VIEW
      },
      {
        createdDate: formatDate(new Date('2020-04-08'), 'MM/dd/yyyy h:mm', 'en-US'),
        type: 'Notification',
        assignment: 'New role request for Planner',
        assignedTo: 'Planner Manager',
        from: 'John Doe',
        status: 'In progress',
        inUseBy: 'Ken Bradley',
        lastEditedBy: '',
        dueDate: '',
        action: this.gridActionState.LOCKED
      },
      {
        createdDate: formatDate(new Date('2020-04-06'), 'MM/dd/yyyy h:mm', 'en-US'),
        type: 'Action Item',
        assignment: 'Create March Employee Status Report',
        assignedTo: this.appModel.userDetails.fullName,
        from: 'Nary All_Managers',
        status: 'In progress',
        inUseBy: '',
        lastEditedBy: this.appModel.userDetails.fullName,
        dueDate: formatDate(new Date('2020-04-31'), 'MM/dd/yyyy h:mm', 'en-US'),
        action: this.gridActionState.VIEW
      },
      {
        createdDate: formatDate(new Date('2020-04-03'), 'MM/dd/yyyy h:mm', 'en-US'),
        type: 'Funds Transfer Request',
        assignment: 'From BSP to CALS',
        assignedTo: 'Budget Manager',
        from: 'Spend Plan Editor',
        status: 'Open',
        inUseBy: '',
        lastEditedBy: '',
        dueDate: formatDate(new Date('2020-05-21'), 'MM/dd/yyyy h:mm', 'en-US'),
        action: this.gridActionState.VIEW
      }
    ];
  }
}

export interface RowDataStateInterface {
  currentEditingRowIndex?: number;
  isAddMode?: boolean;
  isEditMode?: boolean;
  currentEditingRowData?: any;
}
