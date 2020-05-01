import { Component, OnInit } from '@angular/core';
import { ColDef, GridApi } from '@ag-grid-community/all-modules';
import { DatePickerCellRendererComponent } from 'src/app/pfm-coreui/datagrid/renderers/date-picker-cell-renderer/date-picker-cell-renderer.component';
import { DatePickerCellEditorComponent } from 'src/app/pfm-coreui/datagrid/renderers/date-picker-cell-editor/date-picker-cell-editor.component';
import { formatDate } from '@angular/common';
import { AppModel } from 'src/app/pfm-common-models/AppModel';
import { MprActionCellRendererComponent } from 'src/app/pfm-coreui/datagrid/renderers/mpr-action-cell-renderer/mpr-action-cell-renderer.component';
import { reduce } from 'rxjs/operators';

@Component({
  selector: 'pfm-my-pending-requests',
  templateUrl: './my-pending-requests.component.html',
  styleUrls: ['./my-pending-requests.component.scss']
})
export class MyPendingRequestsComponent implements OnInit {
  rows: any;
  columnDefinitions: ColDef[];
  gridApi: GridApi;
  gridActionState = {
    LOCKED: {
      canView: false
    },
    VIEW_DELETE: {
      canView: true,
      isSingleDelete: true
    }
  };

  constructor(private appModel: AppModel) {}

  ngOnInit(): void {
    this.setupGrid();
  }

  onGridIsReady(gridApi: GridApi) {
    this.gridApi = gridApi;
    this.loadRows();
  }

  private setupGrid() {
    const cellStyle = { display: 'flex', 'align-items': 'center', 'white-space': 'normal' };
    const dueDateStyle = params => {
      const dateDiff: number = new Date(params.data.dueDate).valueOf() - new Date().valueOf();
      const diffInHours = dateDiff / 1000 / 60 / 60;
      const color = diffInHours > 48 ? 'green' : diffInHours > 0 && diffInHours <= 48 ? 'yellow' : 'red';
      return { display: 'flex', 'align-items': 'center', 'white-space': 'normal', backgroundColor: color };
    };
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
        cellStyle: cellStyle.valueOf()
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
        cellStyle: cellStyle.valueOf()
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
        cellStyle: cellStyle.valueOf()
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
        cellStyle: cellStyle.valueOf()
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
        cellStyle: cellStyle.valueOf()
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
        cellStyle: cellStyle.valueOf(),
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
        cellStyle: cellStyle.valueOf()
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
        cellStyle: cellStyle.valueOf()
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
        cellStyle: dueDateStyle,
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
        cellStyle: cellStyle.valueOf(),
        cellRendererFramework: MprActionCellRendererComponent,
        maxWidth: 130
      }
    ];
  }

  private loadRows() {
    this.rows = [
      {
        createdDate: formatDate(new Date('2020-04-07 14:34'), 'M/d/yyyy HH:mm', 'en-US'),
        type: 'Add Role',
        assignment: 'Add Budget Manager Role',
        assignedTo: 'POM Manager',
        from: this.appModel.userDetails.fullName,
        status: 'Open',
        inUseBy: '',
        lastEditedBy: '',
        dueDate: formatDate(new Date('2020-04-06 17:00'), 'M/d/yyyy HH:mm', 'en-US'),
        action: this.gridActionState.VIEW_DELETE
      },
      {
        createdDate: formatDate(new Date('2020-04-05 14:34'), 'M/d/yyyy HH:mm', 'en-US'),
        type: 'Action Item',
        assignment: '<Action Item Title>',
        assignedTo: 'Mary All_Manager',
        from: this.appModel.userDetails.fullName,
        status: 'In Progress',
        inUseBy: 'Mary All_Manager',
        lastEditedBy: '',
        dueDate: formatDate(new Date('2020-04-07 12:00'), 'M/d/yyyy HH:mm', 'en-US'),
        action: this.gridActionState.LOCKED
      },
      {
        createdDate: formatDate(new Date('2020-04-02 22:34'), 'M/d/yyyy HH:mm', 'en-US'),
        type: 'Funds Transfer Request',
        assignment: 'From BSP to CALS',
        assignedTo: 'Splend Plan Editor',
        from: 'Budget Manager',
        status: 'In Progress',
        inUseBy: '',
        lastEditedBy: 'Bob Copeland',
        dueDate: formatDate(new Date('2020-05-02 11:30'), 'M/d/yyyy HH:mm', 'en-US'),
        action: this.gridActionState.VIEW_DELETE
      }
    ];
  }
}
