import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { ColumnApi, GridApi } from '@ag-grid-community/all-modules';
import { DataGridMessage } from '../../../../pfm-coreui/models/DataGridMessage';
import { ProgrammingModel } from '../../../models/ProgrammingModel';
import { ProgramSummary } from '../../../models/ProgramSummary';
import { Router } from '@angular/router';
import { Role } from '../../../../pfm-common-models/Role';
import { ListItem } from '../../../../pfm-common-models/ListItem';
import { AppModel } from '../../../../pfm-common-models/AppModel';
import { RoleConstants } from 'src/app/pfm-common-models/role-contants.model';
import { PrsActionCellRendererComponent } from 'src/app/pfm-coreui/datagrid/renderers/prs-action-cell-renderer/prs-action-cell-renderer.component';
import { ProgrammingService } from 'src/app/programming-feature/services/programming-service';
import { DialogService } from 'src/app/pfm-coreui/services/dialog.service';
import { RestResponse } from 'src/app/util/rest-response';

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
  columnHeaders: string[] = ['PY-1', 'PY', 'CY', 'BY', 'BY+1', 'BY+2', 'BY+3', 'BY+4'];

  id = 'requests-summary-component';
  busy: boolean;
  deleteDialog: DeleteDialogInterface = { title: 'Delete' };

  constructor(
    private programmingModel: ProgrammingModel,
    private appModel: AppModel,
    private router: Router,
    private programmingService: ProgrammingService,
    private dialogService: DialogService
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
            cellClass: 'pfm-datagrid-text pfm-datagrid-text-underline pfm-datagrid-lightgreybg'
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
            cellClass: 'pfm-datagrid-text pfm-datagrid-lightgreybg'
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
            cellClass: 'pfm-datagrid-text pfm-datagrid-warning pfm-datagrid-lightgreybg'
          }
        ]
      }
    ];

    this.gridMinYear = this.programmingModel.pom.fy - 3;
    this.gridMaxYear = this.programmingModel.pom.fy + 4;
    for (let i = this.gridMinYear; i <= this.gridMaxYear; i++) {
      let fyColumnHeaderName = i.toString();
      fyColumnHeaderName = 'FY' + fyColumnHeaderName.substr(fyColumnHeaderName.length - 2);
      this.columns.push({
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
            cellClass:
              'pfm-datagrid-numeric-class' + (i >= this.programmingModel.pom.fy ? ' pfm-datagrid-lightgreybg' : ''),
            valueFormatter: params => this.currencyFormatter(params.data.funds[params.colDef.field])
          }
        ]
      });
    }

    this.columns.push({
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
          field: 'action',
          maxWidth: 120,
          minWidth: 120,
          rowDrag: false,
          cellStyle: { display: 'flex', 'align-items': 'center', 'white-space': 'normal' },
          cellRendererFramework: PrsActionCellRendererComponent
        }
      ]
    });
    this.isExternalFilterPresent = this.isExternalFilterPresent.bind(this);
    this.doesExternalFilterPass = this.doesExternalFilterPass.bind(this);
    this.resetGridData();
  }

  currencyFormatter(params) {
    return (
      '$ ' +
      Math.floor(params)
        .toString()
        .replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1,')
    );
  }

  handleCellAction(cellAction: DataGridMessage): void {
    switch (cellAction.message) {
      case 'delete-program':
        this.deleteDialog.bodyText = 'Are you sure you want to delete?';
        this.displayDeleteDialog(cellAction, this.deleteRow.bind(this));
        break;
      case 'cellClicked':
        this.onCellClicked(cellAction);
        break;
    }
  }

  onCellClicked(cellAction: DataGridMessage): void {
    if (cellAction.columnId === 'programName') {
      // navigate to the program details
      this.programmingService.canEditPR(cellAction.rowData['id']).subscribe(
        (resp: RestResponse<boolean>) => {
          this.router.navigate(
            [
              '/programming/requests/details/' + cellAction.rowData['id'],
              {
                pomYear: this.pomYear
              }
            ],
            { state: { editMode: resp.result } }
          );
        },
        error => this.dialogService.displayDebug(error)
      );
    }
  }

  onGridIsReady(gridApi: GridApi): void {
    this.gridApi = gridApi;
    this.gridDataChange.emit(this.gridData);
  }

  onColumnIsReady(columnApi: ColumnApi): void {
    this.columnApi = columnApi;
  }

  ngOnInit() {}

  getRoleName(key: string): string {
    const role = this.programmingModel.roles.get(key);
    return role ? role.name : 'Unknown Role';
  }

  resetGridData() {
    this.gridData = [];
    for (const program of this.programmingModel.programs) {
      const ps = new ProgramSummary();
      ps.id = program.id;
      ps.containerId = program.containerId;
      ps.organizationId = program.organizationId;
      ps.programName = program.shortName;
      ps.assignedTo = this.getRoleName(program.responsibleRoleId);
      ps.status = program.programStatus;
      ps.action = program.userCreated ? { canDeleteProgram: true } : null;
      ps.funds = {};
      ps.fundsTotal = 0;
      for (let i = this.gridMinYear; i <= this.gridMaxYear; i++) {
        ps.funds[i] = 0;
      }
      for (const fundingLine of program.fundingLines) {
        for (let i = this.gridMinYear; i <= this.gridMaxYear; i++) {
          const fund = parseInt(((fundingLine.funds[i] ?? 0) / 1000).toString(), 10);
          if (fund) {
            ps.funds[i] += fund;
            ps.fundsTotal += fund;
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
    return !this.appModel.userDetails.roles.includes(RoleConstants.POM_MANAGER);
  }

  doesExternalFilterPass(node) {
    return this.appModel.userDetails.roles.includes(node.data.assignedTo);
  }

  private deleteRow(rowIndex: number) {
    const program = this.gridData[rowIndex];
    if (program.id) {
      this.programmingService.remove(program.id).subscribe(
        () => {
          this.gridData.splice(rowIndex, 1);
          const modelProgramIndex = this.programmingModel.programs.findIndex(
            modelProgram => modelProgram.id === program.id
          );
          this.programmingModel.programs.splice(modelProgramIndex, 1);
          this.gridApi.setRowData(this.gridData);
          this.gridDataChange.emit(this.gridData);
        },
        error => {
          this.dialogService.displayDebug(error);
        }
      );
    }
  }

  private displayDeleteDialog(cellAction: DataGridMessage, deleteFunction: (rowIndex: number) => void) {
    this.deleteDialog.cellAction = cellAction;
    this.deleteDialog.delete = deleteFunction;
    this.deleteDialog.display = true;
  }

  onCancelDeleteDialog() {
    this.closeDeleteDialog();
  }

  onDeleteData() {
    this.deleteDialog.delete(this.deleteDialog.cellAction.rowIndex);
    this.closeDeleteDialog();
  }

  private closeDeleteDialog() {
    this.deleteDialog.cellAction = null;
    this.deleteDialog.delete = null;
    this.deleteDialog.display = false;
  }
}

export interface DeleteDialogInterface {
  title: string;
  bodyText?: string;
  display?: boolean;
  cellAction?: DataGridMessage;
  delete?: (rowIndex: number) => void;
}
