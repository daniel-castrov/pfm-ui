import { Component, OnInit } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { ColDef } from '@ag-grid-community/all-modules';
import { GridApi } from 'ag-grid-community';
import { AppModel } from '../pfm-common-models/AppModel';
import { ActionCellRendererComponent } from '../pfm-coreui/datagrid/renderers/action-cell-renderer/action-cell-renderer.component';
import { UserDetailsModel } from '../pfm-common-models/UserDetailsModel';
import { FileMetaData } from '../pfm-common-models/FileMetaData';
import { FileDownloadService } from '../pfm-secure-filedownload/services/file-download-service';

@Component({
  selector: 'app-pfm-user-profile',
  templateUrl: './pfm-user-profile.component.html',
  styleUrls: ['./pfm-user-profile.component.scss']
})
export class PfmUserProfileComponent implements OnInit {
  rows: any;
  userDetails: UserDetailsModel = null;
  columnDefinitions: ColDef[];
  gridApi: GridApi;
  form = this.fb.group({
    firstName: [],
    middleName: [],
    lastName: [],
    title: [],
    email: [],
    phone: [],
    active: [],
    profilePictureId: []
  });
  private isUploading: any;
  imagePath: string;

  constructor(private appModel: AppModel, private fileDownloadService: FileDownloadService, private fb: FormBuilder) {}

  ngOnInit(): void {
    this.setupGrid();
    this.userDetails = this.appModel.userDetails;
    this.updateForm(this.userDetails);
  }

  private updateForm(userDetails: UserDetailsModel) {
    this.form.patchValue({
      firstName: userDetails.firstName,
      middleName: userDetails.middleInitial,
      lastName: userDetails.lastName,
      title: userDetails.title,
      email: userDetails.communication.primaryEmail,
      phone: userDetails.communication.primaryPhone,
      active: !userDetails.suspended,
      profilePictureId: userDetails.profilePictureId
    });
    this.loadImage();
  }

  onUploading(event) {
    this.isUploading = event;
  }

  onFileUploaded(fileResponse: FileMetaData) {
    this.form.patchValue({
      profilePictureId: fileResponse.id
    });
    this.loadImage();
  }

  loadImage() {
    const profilePictureId = this.form.get('profilePictureId');
    if (profilePictureId.value) {
      this.fileDownloadService.downloadSecureResource(profilePictureId.value).then(blob => {
        const reader = new FileReader();
        reader.readAsDataURL(blob);
        reader.onloadend = () => {
          const base64data = reader.result;
          this.imagePath = base64data.toString();
        };
      });
    }
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
