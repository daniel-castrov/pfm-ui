import { Component, OnInit, ViewChild } from '@angular/core';
import { FileMetaData } from 'src/app/pfm-common-models/FileMetaData';
import { ActivatedRoute } from '@angular/router';
import { RestResponse } from 'src/app/util/rest-response';
import { ListItem } from 'src/app/pfm-common-models/ListItem';
import { getListItems } from '../../models/enumerations/execution-btr-subtype.model';
import { FormGroup, FormControl, Validators, ValidatorFn, ValidationErrors } from '@angular/forms';
import { GridApi, ColDef } from '@ag-grid-community/all-modules';
import { ExecutionLine } from '../../models/execution-line.model';
import { ExecutionLineService } from '../../services/execution-line.service';
import { SecureDownloadComponent } from 'src/app/pfm-secure-filedownload/secure-download/secure-download.component';

@Component({
  selector: 'pfm-realign-funds',
  templateUrl: './realign-funds.component.html',
  styleUrls: ['./realign-funds.component.scss']
})
export class RealignFundsComponent implements OnInit {
  @ViewChild(SecureDownloadComponent)
  secureDownloadComponent: SecureDownloadComponent;

  title: string;
  showUploadDialog: boolean;
  busy: boolean;
  subtypes: ListItem[];
  form: FormGroup;
  fromRows: ExecutionLine[] = [];
  fromColumnDefinitions: ColDef[];
  fromGridApi: GridApi;
  toRows: ExecutionLine[] = [];
  toColumnDefinitions: ColDef[];
  toGridApi: GridApi;
  cellStyle: any;
  selectedExecutionLine: ExecutionLine;
  executionYear: number;
  attachmentsUploaded: ListItem[];

  constructor(private route: ActivatedRoute, private executionLineService: ExecutionLineService) {}

  ngOnInit(): void {
    history.state.type = 'BTR'; // TODO delete this
    const executionLineId = this.route.snapshot.paramMap.get('id');
    this.executionYear = Number(this.route.snapshot.paramMap.get('exeYear'));
    if (history.state.type) {
      this.title =
        history.state.type === 'BTR'
          ? `BTR Update for Execution FY${this.executionYear.toString().substr(2, 4)}`
          : `Update for Execution FY${this.executionYear.toString().substr(2, 4)}`;

      this.executionLineService.getById(executionLineId).subscribe((resp: RestResponse<ExecutionLine>) => {
        this.selectedExecutionLine = resp.result;
      });

      this.subtypes = getListItems();
      this.loadForm();
      this.cellStyle = { display: 'flex', 'align-items': 'center', 'white-space': 'normal' };
      this.setupGrids();
      this.getAttachment();
    }
  }

  loadForm(): void {
    this.form = new FormGroup({
      subtype: new FormControl(null, [Validators.required]),
      notes: new FormControl()
    });
  }

  setupGrids(): void {
    this.setupFromGrid();
    this.setupToGrid();
  }

  setupFromGrid(): void {
    this.fromColumnDefinitions = [
      {
        headerName: 'Execution Line',
        field: 'executionLine',
        colId: 'executionLine',
        editable: false,
        suppressMovable: true,
        filter: false,
        sortable: false,
        suppressMenu: true,
        cellClass: 'pfm-datagrid-text pfm-datagrid-text-underline pfm-datagrid-lightgreybg'
      },
      {
        headerName: 'FYxx',
        field: 'fy',
        editable: true,
        suppressMovable: true,
        filter: false,
        sortable: false,
        suppressMenu: true,
        cellClass: 'text-class',
        cellStyle: this.cellStyle,
        maxWidth: 200,
        minWidth: 200
      },
      {
        headerName: 'TOA',
        field: 'toa',
        editable: true,
        suppressMovable: true,
        filter: false,
        sortable: false,
        suppressMenu: true,
        cellClass: 'text-center',
        cellStyle: this.cellStyle,
        maxWidth: 200,
        minWidth: 200
      },
      {
        headerName: 'Released',
        field: 'released',
        editable: true,
        suppressMovable: true,
        filter: false,
        sortable: false,
        suppressMenu: true,
        cellClass: 'text-class',
        cellStyle: this.cellStyle,
        maxWidth: 120,
        minWidth: 120
      },
      {
        headerName: 'Withhold',
        field: 'withhold',
        editable: false,
        suppressMovable: true,
        filter: false,
        sortable: false,
        suppressMenu: true,
        cellClass: 'text-class',
        cellStyle: this.cellStyle,
        maxWidth: 150,
        minWidth: 150
      }
    ];
  }

  setupToGrid(): void {
    this.toColumnDefinitions = [
      {
        headerName: 'Execution Line',
        field: 'executionLine',
        colId: 'executionLine',
        editable: false,
        suppressMovable: true,
        filter: false,
        sortable: false,
        suppressMenu: true,
        cellClass: 'pfm-datagrid-text pfm-datagrid-text-underline pfm-datagrid-lightgreybg'
      },
      {
        headerName: 'FYxx',
        field: 'fy',
        editable: true,
        suppressMovable: true,
        filter: false,
        sortable: false,
        suppressMenu: true,
        cellClass: 'text-class',
        cellStyle: this.cellStyle,
        maxWidth: 200,
        minWidth: 200
      },
      {
        headerName: 'TOA',
        field: 'toa',
        editable: true,
        suppressMovable: true,
        filter: false,
        sortable: false,
        suppressMenu: true,
        cellClass: 'text-center',
        cellStyle: this.cellStyle,
        maxWidth: 200,
        minWidth: 200
      },
      {
        headerName: 'Released',
        field: 'released',
        editable: true,
        suppressMovable: true,
        filter: false,
        sortable: false,
        suppressMenu: true,
        cellClass: 'text-class',
        cellStyle: this.cellStyle,
        maxWidth: 120,
        minWidth: 120
      },
      {
        headerName: 'Withhold',
        field: 'withhold',
        editable: false,
        suppressMovable: true,
        filter: false,
        sortable: false,
        suppressMenu: true,
        cellClass: 'text-class',
        cellStyle: this.cellStyle,
        maxWidth: 150,
        minWidth: 150
      },
      {
        headerName: 'Amount',
        field: 'amount',
        editable: false,
        suppressMovable: true,
        filter: false,
        sortable: false,
        suppressMenu: true,
        cellClass: 'text-class',
        cellStyle: this.cellStyle,
        maxWidth: 150,
        minWidth: 150
      },
      {
        headerName: 'Actions',
        field: 'actions',
        editable: false,
        suppressMovable: true,
        filter: false,
        sortable: false,
        suppressMenu: true,
        cellClass: 'text-class',
        cellStyle: this.cellStyle,
        maxWidth: 150,
        minWidth: 150
      }
    ];
  }

  onFromGridIsReady(gridApi: GridApi): void {
    this.fromGridApi = gridApi;
  }

  onToGridIsReady(gridApi: GridApi): void {
    this.toGridApi = gridApi;
  }

  handleAttachment(newFile: FileMetaData): void {}

  downloadAttachment(file: ListItem) {
    const fileMetaData = new FileMetaData();
    fileMetaData.id = file.id;
    fileMetaData.name = file.name;
    this.secureDownloadComponent.downloadFile(fileMetaData);
  }

  getAttachment(): void {
    const mockup = [];
    mockup.forEach(attachment => {
      this.attachmentsUploaded.push({
        id: attachment.file.id,
        isSelected: false,
        name: attachment.file.name,
        value: attachment.file.id,
        rawData: attachment
      });
    });
  }

  onFileUploadClick() {
    this.showUploadDialog = true;
  }

  onSubmit() {}

  onCancel() {}
}
