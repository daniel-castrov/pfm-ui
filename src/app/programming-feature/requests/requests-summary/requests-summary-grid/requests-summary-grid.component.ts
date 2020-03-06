import { Component, OnInit, EventEmitter, Output, Input } from '@angular/core';
import { ColumnApi, GridApi } from '@ag-grid-community/all-modules';
import { DataGridMessage } from '../../../../pfm-coreui/models/DataGridMessage';
import { ProgrammingModel } from '../../../models/ProgrammingModel';
import { ProgramSummary } from '../../../models/ProgramSummary';
import { Router } from '@angular/router';
import { Role } from '../../../../pfm-common-models/Role';
import { ListItem } from '../../../../pfm-common-models/ListItem';
import { AppModel } from '../../../../pfm-common-models/AppModel';

@Component({
  selector: 'pfm-requests-summary-grid',
  templateUrl: './requests-summary-grid.component.html',
  styleUrls: ['./requests-summary-grid.component.scss']
})

export class RequestsSummaryGridComponent implements OnInit {
  @Input() pomYear: number;
  @Input() dropdownOptions: ListItem[];
  @Output() addCtaEvent: EventEmitter<any> = new EventEmitter<any>();
  @Output() gridDataChange = new EventEmitter();

  gridApi: GridApi;
  columnApi: ColumnApi;
  columns: any[];
  gridMinYear: number;
  gridMaxYear: number;
  roles: Map<string, Role>;
  gridData: ProgramSummary[];
  columnHeaders: string[] = ['PY-1', 'PY', 'CY', 'BY', 'BY+1', 'BY+2', 'BY+3', 'BY+4']

  id = 'requests-summary-component';
  busy: boolean;

  constructor(
    private programmingModel: ProgrammingModel,
    private appModel: AppModel,
    private router: Router
  ) {
    this.columns = [
      {
        groupId: 'sub-header',
        headerName: '',
        headerClass: this.headerClassFunc,
        marryChildren: true,
        children: [
          {
            groupId: 'main-header',
            headerName: 'Program',
            field: 'programName',
            editable: false,
            cellClass: 'pfm-datagrid-text pfm-datagrid-text-underline pfm-datagrid-lightgreybg',
          }
        ]
      },
      {
        groupId: 'sub-header',
        headerName: '',
        headerClass: this.headerClassFunc,
        marryChildren: true,
        children: [
          {
            groupId: 'main-header',
            headerName: 'Assigned To',
            field: 'assignedTo',
            editable: false,
            cellClass: 'pfm-datagrid-text pfm-datagrid-lightgreybg',
          }
        ]
      },
      {
        groupId: 'sub-header',
        headerName: 'Funds in $K',
        headerClass: this.headerClassFunc,
        marryChildren: true,
        children: [
          {
            groupId: 'main-header',
            headerName: 'Status',
            field: 'status',
            editable: false,
            cellClass: 'pfm-datagrid-text pfm-datagrid-warning pfm-datagrid-lightgreybg',
          }
        ]
      },
    ];

    this.gridMinYear = this.programmingModel.pom.fy - 3;
    this.gridMaxYear = this.programmingModel.pom.fy + 4;
    for (let i = this.gridMinYear; i <= this.gridMaxYear; i++) {
      let fyColumnHeaderName = i.toString();
      fyColumnHeaderName = 'FY' + fyColumnHeaderName.substr(fyColumnHeaderName.length - 2);
      this.columns.push(
        {
          groupId: 'sub-header',
          headerName: this.columnHeaders[i - this.gridMinYear],
          headerClass: this.headerClassFunc,
          marryChildren: true,
          children: [
            {
              groupId: 'main-header',
              headerName: fyColumnHeaderName,
              field: i.toString(),
              maxWidth: 100,
              minWidth: 100,
              rowDrag: false,
              cellClass: 'pfm-datagrid-numeric-class'
                + ((i >= this.programmingModel.pom.fy) ? ' pfm-datagrid-lightgreybg' : ''),
              valueFormatter: params => this.currencyFormatter(params.data.funds[params.colDef.field])
            }
          ]
        }
      );
    }

    this.columns.push(
      {
        groupId: 'sub-header',
        headerName: '',
        headerClass: this.headerClassFunc,
        marryChildren: true,
        children: [
          {
            groupId: 'main-header',
            headerName: 'FYDP Total',
            field: 'fundsTotal',
            maxWidth: 120,
            minWidth: 120,
            rowDrag: false,
            cellClass: 'pfm-datagrid-numeric-class',
            valueFormatter: params => this.currencyFormatter(params.data[params.colDef.field])
          },
          {
            groupId: 'main-header',
            headerName: 'Actions',
            maxWidth: 120,
            minWidth: 120,
            rowDrag: false,
          }
        ]
      },
    );
    this.isExternalFilterPresent = this.isExternalFilterPresent.bind(this);
    this.doesExternalFilterPass = this.doesExternalFilterPass.bind(this);
    this.resetGridData();
  }

  currencyFormatter(params) {
    return '$ ' + Math.floor(params).toString().replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1,');
  }

  handleCellAction(cellAction: DataGridMessage): void {
    switch (cellAction.message) {
      case 'save': {
        break;
      }
      case 'edit': {
        break;
      }
      case 'upload': {
        break;
      }
      case 'delete-row': {
        break;
      }
      case 'delete-attachments': {
        break;
      }
      case 'download-attachment': {
        break;
      }
      case 'cellClicked': {
        this.onCellClicked(cellAction);
      }
    }
  }

  onCellClicked(cellAction: DataGridMessage): void {
    if (cellAction.columnId === 'programName') {
      // navigate to the program details
      this.router.navigate(
        ['/programming/requests/details/' + cellAction.rowData['id'],
        {
          pomYear: this.pomYear
        }
        ]);
    }
  }

  onGridIsReady(gridApi: GridApi): void {
    this.gridApi = gridApi;
    this.gridDataChange.emit(this.gridData);
  }

  onColumnIsReady(columnApi: ColumnApi): void {
    this.columnApi = columnApi;
  }

  ngOnInit() {
  }

  getRoleName(key: string): string {
    const role = this.programmingModel.roles.get(key);
    return (role) ? role.name : 'Unknown Role';
  }

  resetGridData() {
    this.gridData = [];
    for (const program of this.programmingModel.programs) {
      const ps = new ProgramSummary();
      ps.id = program.id;
      ps.organiztionId = program.organizationId;
      ps.programName = program.shortName;
      ps.assignedTo = this.getRoleName(program.responsibleRoleId);
      ps.status = program.programStatus;
      ps.funds = {};
      ps.fundsTotal = 0;
      for (let i = this.gridMinYear; i <= this.gridMaxYear; i++) {
        ps.funds[i] = 0;
      }
      for (const fundingLine of program.fundingLines) {
        for (let i = this.gridMinYear; i <= this.gridMaxYear; i++) {
          if (fundingLine.funds[i]) {
            ps.funds[i] += fundingLine.funds[i];
            ps.fundsTotal += ps.funds[i];
          }
        }
      }
      this.gridData.push(ps);
    }
  }

  headerClassFunc(params: any) {
    let isSubHeader = false;
    let isMainHeader = false;
    let column = params.column ? params.column : params.columnGroup;
    while (column) {
      if (column.getDefinition().groupId === 'main-header') {
        isMainHeader = true;
      } else if (column.getDefinition().groupId === 'sub-header') {
        isSubHeader = true;
      }
      column = column.getParent();
    }
    if (isSubHeader) {
      return 'sub-header';
    } else if (isMainHeader) {
      return 'main-header';
    } else {
      return null;
    }
  }

  onAddProgram(event: any) {
    this.addCtaEvent.emit(event);
  }

  isExternalFilterPresent() {
    return !this.appModel.userDetails.roles.includes('POM_Manager');
  }

  doesExternalFilterPass(node) {
    return this.appModel.userDetails.roles.includes(node.data.assignedTo);
  }
}
