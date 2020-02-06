import { Component, OnInit, EventEmitter, Output, Input } from '@angular/core';
import { ColumnApi, GridApi } from '@ag-grid-community/all-modules';
import { DialogService } from '../../../../pfm-coreui/services/dialog.service';
import { DataGridMessage } from '../../../../pfm-coreui/models/DataGridMessage';
import { ProgrammingModel } from '../../../models/ProgrammingModel';
import { ProgramSummary } from '../../../models/ProgramSummary';
import { Router } from '@angular/router';
import { RoleService } from '../../../../services/role-service';
import { Role } from '../../../../pfm-common-models/Role';
import { ListItem } from '../../../../pfm-common-models/ListItem';

@Component({
    selector: 'pfm-requests-summary-grid',
    templateUrl: './requests-summary-grid.component.html',
    styleUrls: ['./requests-summary-grid.component.scss']
})


export class RequestsSummaryGridComponent implements OnInit {
    @Input() dropdownOptions: ListItem[];
    @Output() onAddCtaEvent: EventEmitter<any> = new EventEmitter<any>();
    @Output() onGridDataChange = new EventEmitter();

    gridApi: GridApi;
    columnApi: ColumnApi;
    columns: any[];
    gridMinYear: number;
    gridMaxYear: number;
    roles: Map<string, Role>;
    gridData: ProgramSummary[];

    id: string = 'requests-summary-component';
    busy: boolean;

    constructor(private dialogService: DialogService, private programmingModel: ProgrammingModel, private router: Router, private roleService: RoleService) {
        this.columns = [
            {
                headerName: 'Program',
                field: 'programName',
                editable: false,
                cellClass: 'pfm-datagrid-text pfm-datagrid-text-underline pfm-datagrid-lightgreybg',
            },
            {
                headerName: 'Assigned To',
                field: 'assignedTo',
                editable: false,
                cellClass: 'pfm-datagrid-text pfm-datagrid-lightgreybg',
            },
            {
                headerName: 'Status',
                field: 'status',
                editable: false,
                cellClass: 'pfm-datagrid-text pfm-datagrid-warning pfm-datagrid-lightgreybg',
            },
        ];

        this.gridMinYear = this.programmingModel.pom.fy - 3;
        this.gridMaxYear = this.programmingModel.pom.fy + 4;
        for (let i = this.gridMinYear; i <= this.gridMaxYear; i++) {
            let fyColumnHeaderName = i.toString();
            fyColumnHeaderName = 'FY' + fyColumnHeaderName.substr(fyColumnHeaderName.length - 2);
            this.columns.push(
                {
                    headerName: fyColumnHeaderName,
                    field: i.toString(),
                    maxWidth: 100,
                    minWidth: 100,
                    rowDrag: false,
                    cellClass: 'pfm-datagrid-numeric-class'
                    + ((i >= this.programmingModel.pom.fy) ? ' pfm-datagrid-lightgreybg' : ''),
                    valueGetter(params) {
                        return '$' + params.data.funds[params.colDef.field];
                    }
                }
            );
        }

        this.columns.push(
            {
                headerName: 'FYDP Total',
                field: 'fundsTotal',
                maxWidth: 120,
                minWidth: 120,
                rowDrag: false,
                cellClass: 'pfm-datagrid-numeric-class',
                valueGetter(params) {
                    return '$' + params.data[params.colDef.field];
                },
            }
        );
        this.resetGridData();
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
            this.router.navigate(['/programming/requests/details/' + cellAction.rowData['programName']]);

        }
    }

    onGridIsReady(gridApi: GridApi): void {
        this.gridApi = gridApi;
        this.onGridDataChange.emit(this.gridData);
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

  onAddProgram( event:any ) {
    this.onAddCtaEvent.emit(event);
  }
}
