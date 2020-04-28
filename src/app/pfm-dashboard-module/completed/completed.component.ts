import { Component, OnDestroy, OnInit } from '@angular/core';
import { DatePickerCellRendererComponent } from '../../pfm-coreui/datagrid/renderers/date-picker-cell-renderer/date-picker-cell-renderer.component';
import { DatePickerCellEditorComponent } from '../../pfm-coreui/datagrid/renderers/date-picker-cell-editor/date-picker-cell-editor.component';
import { ColDef } from '@ag-grid-community/all-modules';
import { GridApi } from 'ag-grid-community';
import { formatDate } from '@angular/common';
import { AppModel } from '../../pfm-common-models/AppModel';
import { AtmActionCellRendererComponent } from '../../pfm-coreui/datagrid/renderers/atm-action-cell-renderer/atm-action-cell-renderer.component';
import { ListItem } from 'src/app/pfm-common-models/ListItem';
import * as moment from 'moment';

@Component({
  selector: 'pfm-completed',
  templateUrl: './completed.component.html',
  styleUrls: ['./completed.component.scss']
})
export class CompletedComponent implements OnInit, OnDestroy {
  rows: any;
  data: any;
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

  daysOptions: ListItem[] = [
    {
      id: 'Last 30 days',
      name: 'Last 30 days',
      value: 'Last 30 days',
      rawData: 'Last 30 days',
      isSelected: true
    },
    {
      id: 'Last 60 days',
      name: 'Last 60 days',
      value: 'Last 60 days',
      rawData: 'Last 60 days',
      isSelected: false
    },
    {
      id: 'Last 90 days',
      name: 'Last 90 days',
      value: 'Last 90 days',
      rawData: 'Last 90 days',
      isSelected: false
    },
    {
      id: 'Last 120 days',
      name: 'Last 120 days',
      value: 'Last 120 days',
      rawData: 'Last 120 days',
      isSelected: false
    },
    {
      id: 'Last 180 days',
      name: 'Last 180 days',
      value: 'Last 180 days',
      rawData: 'Last 180 days',
      isSelected: false
    }
  ];

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
        headerName: 'Due Date',
        field: 'dueDate',
        editable: true,
        suppressMovable: true,
        filter: false,
        sortable: false,
        suppressMenu: true,
        cellClass: 'text-class',
        cellStyle: { display: 'flex', 'align-items': 'center', 'white-space': 'normal' }
      },
      {
        headerName: 'Completed Date',
        field: 'completedDate',
        editable: true,
        suppressMovable: true,
        filter: false,
        sortable: false,
        suppressMenu: true,
        cellClass: 'text-class',
        cellStyle: { display: 'flex', 'align-items': 'center', 'white-space': 'normal' }
      },
      {
        headerName: 'Completed By User',
        field: 'completedByUser',
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
    this.data = [
      {
        createdDate: formatDate(new Date('2020-04-10 13:00'), 'MM/d/yyyy H:mm', 'en-US'),
        type: 'PR',
        assignment: 'BPS',
        assignedTo: 'Financial Manager',
        from: 'Funds Requestor',
        status: 'Approved',
        dueDate: formatDate(new Date('2020-04-12 00:00'), 'MM/d/yyyy H:mm', 'en-US'),
        completedDate: formatDate(new Date('2020-04-11 00:00'), 'MM/d/yyyy H:mm', 'en-US'),
        completedByUser: 'Jane Wright',
        action: this.gridActionState.VIEW
      },
      {
        createdDate: formatDate(new Date('2020-04-07 14:34'), 'MM/d/yyyy H:mm', 'en-US'),
        type: 'Add Role',
        assignment: 'Add Budget Manager Role',
        assignedTo: 'User Approver',
        from: this.appModel.userDetails.fullName,
        status: 'Denied',
        dueDate: formatDate(new Date('2020-04-10 00:00'), 'MM/d/yyyy H:mm', 'en-US'),
        completedDate: formatDate(new Date('2020-04-10 13:00'), 'MM/d/yyyy H:mm', 'en-US'),
        completedByUser: 'Mary All_Managers',
        action: this.gridActionState.VIEW
      },
      {
        createdDate: formatDate(new Date('2020-04-05 14:34'), 'MM/d/yyyy H:mm', 'en-US'),
        type: 'Action Item',
        assignment: '<Action Item Title>',
        assignedTo: 'Mary All_Managers',
        from: this.appModel.userDetails.fullName,
        status: 'Completed',
        dueDate: formatDate(new Date('2020-04-11 00:00'), 'MM/d/yyyy H:mm', 'en-US'),
        completedDate: formatDate(new Date('2020-04-15 00:00'), 'MM/d/yyyy H:mm', 'en-US'),
        completedByUser: 'Mary All_Managers',
        action: this.gridActionState.VIEW
      },
      {
        createdDate: formatDate(new Date('2020-04-02 22:34'), 'MM/d/yyyy H:mm', 'en-US'),
        type: 'Funds Transfer Request',
        assignment: 'From BSP to CALS',
        assignedTo: 'Spend Plan Editor',
        from: 'Budget Manager',
        status: 'Approved',
        dueDate: formatDate(new Date('2020-05-01 00:00'), 'MM/d/yyyy H:mm', 'en-US'),
        completedDate: formatDate(new Date('2020-05-08 00:00'), 'MM/d/yyyy H:mm', 'en-US'),
        completedByUser: 'Josie Miller',
        action: this.gridActionState.VIEW
      }
    ];
    this.performFilter(Number(this.daysOptions[0].name.split(' ')[1]));
  }

  onFilterSelection(event) {
    if (event.name) {
      this.performFilter(Number(event.name.split(' ')[1]));
    }
  }

  performFilter(days: number) {
    const filterDay = moment(new Date()).subtract(days, 'day');
    this.rows = this.data.filter(row => filterDay.isBefore(row.completedDate));
  }
}

export interface RowDataStateInterface {
  currentEditingRowIndex?: number;
  isAddMode?: boolean;
  isEditMode?: boolean;
  currentEditingRowData?: any;
}
