import { Component, OnInit, ElementRef, ViewChild } from '@angular/core';
import { PlanningStatus } from 'src/app/planning-feature/models/enumerators/planning-status.model';
import { ProgrammingModel } from '../models/ProgrammingModel';
import { ProgrammingService } from '../services/programming-service';
import { IntIntMap } from '../models/IntIntMap';
import { ListItemHelper } from '../../util/ListItemHelper';
import { ListItem } from 'src/app/pfm-common-models/ListItem';
import { GridsterItem, GridsterConfig } from 'angular-gridster2';
import { ProgramSummary } from '../models/ProgramSummary';
import { PomService } from '../services/pom-service';
import { DialogService } from 'src/app/pfm-coreui/services/dialog.service';
import { RequestsSummaryToaWidgetComponent } from '../requests/requests-summary/requests-summary-toa-widget/requests-summary-toa-widget.component';
import { RequestsSummaryOrgWidgetComponent } from '../requests/requests-summary/requests-summary-org-widget/requests-summary-org-widget.component';
import { Organization } from 'src/app/pfm-common-models/Organization';
import { GridApi } from '@ag-grid-community/all-modules';
import { Role } from 'src/app/pfm-common-models/Role';
import { RoleService } from 'src/app/services/role-service';
import { switchMap, map, catchError } from 'rxjs/operators';
import { throwError } from 'rxjs';

@Component({
  selector: 'pfm-programming',
  templateUrl: './open-programming.component.html',
  styleUrls: ['./open-programming.component.scss']
})
export class OpenProgrammingComponent implements OnInit {
  @ViewChild('toaWidgetItem')
  toaWidgetItem: ElementRef<RequestsSummaryToaWidgetComponent>;
  @ViewChild(RequestsSummaryToaWidgetComponent) toaWidget: RequestsSummaryToaWidgetComponent;

  @ViewChild('orgWidgetItem')
  orgWidgetItem: ElementRef<RequestsSummaryOrgWidgetComponent>;
  @ViewChild(RequestsSummaryOrgWidgetComponent) orgWidget: RequestsSummaryOrgWidgetComponent;

  pomYear: number;
  gridApi: GridApi;
  columns: any[];
  gridData: ProgramSummary[];
  minYear: number;
  maxYear: number;

  baBlinSummary: IntIntMap;
  defaultOrganizationSelection: ListItem;
  availableToaCharts: ListItem[];
  orgs: Organization[];
  gridster: Array<GridsterItem>;
  options: GridsterConfig;
  busy: boolean;

  constructor(
    public programmingModel: ProgrammingModel,
    private programmingService: ProgrammingService,
    private pomService: PomService,
    private roleService: RoleService,
    private dialogService: DialogService
  ) {}

  ngOnInit() {
    this.loadData();
    this.loadOrganizations();
    this.setupGridster();
  }

  private setupGridster() {
    this.options = {
      minCols: 8,
      maxCols: 8,
      minRows: 8,
      maxRows: 8,
      itemResizeCallback: event => {
        if (event.id === 'toa-widget') {
          const w: any = this.toaWidgetItem;
          this.toaWidget.onResize(w.width, w.height);
        } else if (event.id === 'org-widget') {
          const w: any = this.orgWidgetItem;
          this.orgWidget.onResize(w.width, w.height);
        }
      },
      draggable: {
        enabled: true
      },
      resizable: {
        enabled: true
      }
    };
    this.gridster = [
      { x: 0, y: 0, cols: 4, rows: 8, id: 'org-widget' },
      {
        x: 0,
        y: 0,
        cols: 4,
        rows: 8,
        id: 'toa-widget'
      }
    ];
  }

  onOpenProgrammingPhase() {}

  private loadData() {
    this.busy = true;
    this.pomService
      .getLatestPom()
      .pipe(
        switchMap(resp => {
          this.programmingModel.pom = (resp as any).result;
          if (this.programmingModel.pom.status === PlanningStatus.CREATED) {
            this.pomYear = this.programmingModel.pom.fy;
            return this.programmingService
              .getPRsForContainer(this.programmingModel.pom.workspaceId, null)
              .pipe(map(programs => (this.programmingModel.programs = (programs as any).result)));
          }
          return throwError('POM should be in CREATED status.');
        }),
        catchError(error => {
          return throwError(error);
        })
      )
      .pipe(
        switchMap(() => {
          return this.programmingService
            .getBaBlinSummary(this.programmingModel.pom.workspaceId, null)
            .pipe(map(bablin => (this.baBlinSummary = (bablin as any).result)));
        }),
        catchError(error => {
          return throwError(error);
        })
      )
      .pipe(
        switchMap(() => {
          return this.roleService
            .getMap()
            .pipe(map(roles => (this.programmingModel.roles = roles as Map<string, Role>)));
        }),
        catchError(error => {
          return throwError(error);
        })
      )
      .pipe(
        map(() => this.setupDatagrid()),
        catchError(error => {
          return throwError(error);
        })
      )
      .pipe(
        map(() => this.loadGridData()),
        catchError(error => {
          return throwError(error);
        })
      )
      .subscribe(
        () => {
          const chartOptions: string[] = ['Community Status', 'Community TOA Difference', 'Funding Line Status'];
          this.availableToaCharts = ListItemHelper.generateListItemFromArray(chartOptions);
          this.defaultOrganizationSelection = ListItemHelper.generateListItemFromArray(['All'])[0];
        },
        error => {
          this.dialogService.displayDebug(error);
        },
        () => (this.busy = false)
      );
  }

  private loadOrganizations() {
    this.programmingService.getPermittedOrganizations().subscribe(
      resp => {
        const orgs = (resp as any).result;
        this.orgs = orgs;
      },
      error => {
        this.dialogService.displayDebug(error);
      }
    );
  }

  onGridIsReady(gridApi: GridApi): void {
    this.gridApi = gridApi;
  }

  private setupDatagrid() {
    const columnHeaders = ['PY-1', 'PY', 'CY', 'BY', 'BY+1', 'BY+2', 'BY+3', 'BY+4'];
    const fiscalYearColumns = [];
    this.minYear = this.programmingModel.pom.fy - 3;
    this.maxYear = this.programmingModel.pom.fy + 4;
    for (let i = this.minYear; i <= this.maxYear; i++) {
      let fyColumnHeaderName = i.toString();
      fyColumnHeaderName = 'FY' + fyColumnHeaderName.substr(fyColumnHeaderName.length - 2);
      fiscalYearColumns.push({
        groupId: 'sub-header',
        headerName: columnHeaders[i - this.minYear],
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
            cellClass: 'pfm-datagrid-text pfm-datagrid-lightgreybg'
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
      },
      ...fiscalYearColumns,
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
            field: 'action',
            maxWidth: 120,
            minWidth: 120,
            rowDrag: false,
            cellStyle: { display: 'flex', 'align-items': 'center', 'white-space': 'normal' }
          }
        ]
      }
    ];
  }

  private loadGridData() {
    this.gridData = [];
    for (const program of this.programmingModel.programs) {
      const ps = new ProgramSummary();
      const role = this.programmingModel.roles.get(program.responsibleRoleId);
      ps.id = program.id;
      ps.containerId = program.containerId;
      ps.organizationId = program.organizationId;
      ps.programName = program.shortName;
      ps.assignedTo = role ? role.name : 'Unknown Role';
      ps.status = program.programStatus;
      ps.action = program.userCreated ? { canDeleteProgram: true } : null;
      ps.funds = {};
      ps.fundsTotal = 0;
      for (let i = this.minYear; i <= this.maxYear; i++) {
        ps.funds[i] = 0;
      }
      for (const fundingLine of program.fundingLines) {
        for (let i = this.minYear; i <= this.maxYear; i++) {
          if (fundingLine.funds[i]) {
            ps.funds[i] += fundingLine.funds[i];
            ps.fundsTotal += ps.funds[i];
          }
        }
      }
      this.gridData.push(ps);
    }
  }

  private headerClassFunc(params: any) {
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

  private currencyFormatter(params) {
    return (
      '$ ' +
      Math.floor(params)
        .toString()
        .replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1,')
    );
  }
}
