import { Component, OnInit } from '@angular/core';
import { ListItem } from 'src/app/pfm-common-models/ListItem';
import { ListItemHelper } from 'src/app/util/ListItemHelper';
import { ColDef, GridApi } from '@ag-grid-community/all-modules';
import { PomService } from '../services/pom-service';
import { UfrActionCellRendererComponent } from 'src/app/pfm-coreui/datagrid/renderers/ufr-action-cell-renderer/ufr-action-cell-renderer.component';

@Component({
  selector: 'pfm-programming',
  templateUrl: './ufr-requests.component.html',
  styleUrls: ['./ufr-requests.component.scss']
})
export class UfrRequestsComponent implements OnInit {
  years: ListItem[];
  busy: boolean;
  rows: any[] = [];
  columnDefinitions: ColDef[];
  gridApi: GridApi;
  selectedYear: ListItem;
  gridAddOptions: ListItem[];

  constructor(private pomService: PomService) {}

  ngOnInit() {
    this.pomService.getPomYearsByStatus(['CREATED', 'OPEN', 'LOCKED', 'CLOSED']).subscribe(resp => {
      const years = (resp as any).result;
      this.years = ListItemHelper.generateListItemFromArray(years.map(y => ['POM ' + y, y]));
    });
    this.gridAddOptions = ListItemHelper.generateListItemFromArray([
      ['Previosly Funded Program', 'prev'],
      ['Program Request', 'pr'],
      ['New FoS', 'nfos'],
      ['New Program', 'np']
    ]);
    this.setupGrid();
  }

  private setupGrid() {
    const cellStyle = { display: 'flex', 'align-items': 'center', 'white-space': 'normal' };
    this.columnDefinitions = [
      {
        headerName: 'UFR',
        field: 'ufr',
        editable: false,
        suppressMovable: true,
        filter: false,
        sortable: false,
        suppressMenu: true,
        cellClass: 'numeric-class',
        cellStyle,
        maxWidth: 80,
        minWidth: 80
      },
      {
        headerName: 'UFR Name',
        field: 'name',
        editable: true,
        suppressMovable: true,
        filter: false,
        sortable: false,
        suppressMenu: true,
        cellClass: 'text-class',
        cellStyle,
        maxWidth: 200,
        minWidth: 200
      },
      {
        headerName: 'Created for',
        field: 'createdFor',
        editable: true,
        suppressMovable: true,
        filter: false,
        sortable: false,
        suppressMenu: true,
        cellClass: 'text-center',
        cellStyle,
        maxWidth: 200,
        minWidth: 200
      },
      {
        headerName: 'Program',
        field: 'program',
        editable: true,
        suppressMovable: true,
        filter: false,
        sortable: false,
        suppressMenu: true,
        cellClass: 'text-class',
        cellStyle,
        maxWidth: 120,
        minWidth: 120
      },
      {
        headerName: 'Funding Request',
        field: 'fundingRequest',
        editable: false,
        suppressMovable: true,
        filter: false,
        sortable: false,
        suppressMenu: true,
        cellClass: 'text-class',
        cellStyle,
        maxWidth: 150,
        minWidth: 150
      },
      {
        headerName: 'Mission Priority',
        field: 'missionPriority',
        editable: false,
        suppressMovable: true,
        filter: false,
        sortable: false,
        suppressMenu: true,
        cellClass: 'numeric-class',
        cellStyle,
        maxWidth: 150,
        minWidth: 150
      },
      {
        headerName: 'Status',
        field: 'status',
        editable: false,
        suppressMovable: true,
        filter: false,
        sortable: false,
        suppressMenu: true,
        cellClass: 'text-class',
        cellStyle,
        maxWidth: 150,
        minWidth: 150
      },
      {
        headerName: 'Created Date',
        field: 'created',
        editable: false,
        suppressMovable: true,
        filter: false,
        sortable: false,
        suppressMenu: true,
        cellClass: 'text-class',
        cellStyle,
        maxWidth: 130,
        minWidth: 130
      },
      {
        headerName: 'Created By',
        field: 'fullNameCreatedBy',
        editable: false,
        suppressMovable: true,
        filter: false,
        sortable: false,
        suppressMenu: true,
        cellClass: 'text-class',
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
        cellClass: 'text-class',
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
        cellClass: 'text-class',
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
        maxWidth: 80,
        minWidth: 80,
        cellRendererFramework: UfrActionCellRendererComponent,
        autoHeight: true
      }
    ];
  }

  onGridIsReady(gridApi: GridApi) {
    this.gridApi = gridApi;
    this.rows = [];
  }
}
