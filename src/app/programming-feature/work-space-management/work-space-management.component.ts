import { Component, OnInit } from '@angular/core';
import { FormatterUtil } from 'src/app/util/formatterUtil';
import { GridApi, ColDef } from '@ag-grid-community/all-modules';
import { formatDate } from '@angular/common';
import { WkspActionCellRendererComponent } from 'src/app/pfm-coreui/datagrid/renderers/wksp-action-cell-renderer/wksp-action-cell-renderer.component';
import { CheckboxCellRendererComponent } from 'src/app/pfm-coreui/datagrid/renderers/checkbox-cell-renderer/checkbox-cell-renderer.component';

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
  gridActionState = {
    workSpaceActions: {
      canView: true,
      canViewFundingLine: true,
      canDuplicate: true
    }
  };
  checkboxConfig = {
    checked: false,
    label: '',
    fieldName: 'status',
    disabled: true
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
        cellStyle: cellStyle.valueOf(),
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
        cellStyle: cellStyle.valueOf()
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
        cellStyle: cellStyle.valueOf(),
        maxWidth: 80,
        cellRendererFramework: CheckboxCellRendererComponent
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
        cellStyle: cellStyle.valueOf()
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
        cellStyle: cellStyle.valueOf()
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
        cellStyle: cellStyle.valueOf()
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
        cellStyle: cellStyle.valueOf()
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
        active: this.checkboxConfig,
        notes: '',
        createdDate: formatDate(new Date('2020-04-12 10:00'), 'M/d/yyyy HH:mm', 'en-US'),
        lastUpdatedDate: formatDate(new Date('2020-04-12 10:00'), 'M/d/yyyy HH:mm', 'en-US'),
        lastUpdatedBy: 'Mary Smith',
        action: this.gridActionState.workSpaceActions
      }
    ];
  }

  compareVersion() {}
}
