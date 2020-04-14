import { Component, OnInit } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { ColDef } from '@ag-grid-community/all-modules';
import { GridApi } from 'ag-grid-community';
import { AppModel } from '../pfm-common-models/AppModel';
import { ActionCellRendererComponent } from '../pfm-coreui/datagrid/renderers/action-cell-renderer/action-cell-renderer.component';
import { UserDetailsModel } from '../pfm-common-models/UserDetailsModel';

@Component({
  selector: 'app-pfm-user-profile-module',
  templateUrl: './pfm-user-profile-module.component.html',
  styleUrls: ['./pfm-user-profile-module.component.scss']
})
export class PfmUserProfileModuleComponent implements OnInit {
  rows: any;
  columnDefinitions: ColDef[];
  gridApi: GridApi;
  form = this.fb.group({
    firstName: [],
    middleName: [],
    lastName: [],
    email: [],
    phone: [],
    active: []
  });

  constructor(private appModel: AppModel, private fb: FormBuilder) {}

  ngOnInit(): void {
    this.setupGrid();
    this.updateForm(this.appModel.userDetails);
  }

  private updateForm(userDetails: UserDetailsModel) {
    this.form.patchValue({
      firstName: userDetails.firstName,
      middleName: userDetails.middleInitial,
      lastName: userDetails.lastName,
      email: userDetails.communication.primaryEmail,
      phone: userDetails.communication.primaryPhone,

      active: !userDetails.suspended
    });
  }

  setupGrid() {
    this.columnDefinitions = [
      {
        headerName: 'Role',
        field: 'role',
        editable: true,
        suppressMovable: true,
        filter: false,
        sortable: false,
        suppressMenu: true,
        cellClass: 'numeric-class',
        cellStyle: { display: 'flex', 'align-items': 'center', 'white-space': 'normal' }
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
        cellRendererFramework: ActionCellRendererComponent,
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
    this.rows = this.appModel.userDetails.roles.map(role => {
      return {
        role
      };
    });
  }
}
