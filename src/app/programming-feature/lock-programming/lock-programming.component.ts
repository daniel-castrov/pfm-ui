import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { ProgrammingModel } from '../models/ProgrammingModel';
import { ProgrammingService } from '../services/programming-service';
import { IntIntMap } from '../models/IntIntMap';
import { ListItemHelper } from '../../util/ListItemHelper';
import { ListItem } from 'src/app/pfm-common-models/ListItem';
import { GridsterConfig, GridsterItem } from 'angular-gridster2';
import { ProgramSummary } from '../models/ProgramSummary';
import { PomService } from '../services/pom-service';
import { DialogService } from 'src/app/pfm-coreui/services/dialog.service';
import { RequestsSummaryToaWidgetComponent } from '../requests/requests-summary/requests-summary-toa-widget/requests-summary-toa-widget.component';
import { RequestsSummaryOrgWidgetComponent } from '../requests/requests-summary/requests-summary-org-widget/requests-summary-org-widget.component';
import { Organization } from 'src/app/pfm-common-models/Organization';
import { GridApi } from '@ag-grid-community/all-modules';
import { Role } from 'src/app/pfm-common-models/Role';
import { RoleService } from 'src/app/services/role-service';
import { catchError, map, switchMap } from 'rxjs/operators';
import { throwError } from 'rxjs';
import { WorkspaceService } from '../services/workspace.service';
import { PomStatus } from '../models/enumerations/pom-status.model';
import { VisibilityService } from '../../services/visibility-service';
import { AppModel } from '../../pfm-common-models/AppModel';
import { Workspace } from '../models/workspace';
import { ToastService } from '../../pfm-coreui/services/toast.service';
import { Router } from '@angular/router';
import {formatDate} from "@angular/common";
import * as moment from "moment";

@Component({
  selector: 'pfm-programming',
  templateUrl: './lock-programming.component.html',
  styleUrls: ['./lock-programming.component.scss']
})
export class LockProgrammingComponent implements OnInit {
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
  isReady: boolean;
  busy: boolean;

  containerId: string;
  workspaces: ListItem[];
  selectedWorkspace: Workspace;

  lockConfirmationDlg = {
    title: 'Lock POM Session',
    continueAction: null,
    display: false
  };

  constructor(
    public programmingModel: ProgrammingModel,
    private programmingService: ProgrammingService,
    private pomService: PomService,
    private roleService: RoleService,
    private dialogService: DialogService,
    private visibilityService: VisibilityService,
    private toastService: ToastService,
    public appModel: AppModel,
    private workspaceService: WorkspaceService,
    private router: Router
  ) {}

  ngOnInit() {
    this.setupVisibility();
    this.loadPOMData();
  }

  setupVisibility() {
    this.visibilityService
      .isCurrentlyVisible('programming-phase-component')
      .toPromise()
      .then(response => {
        if ((response as any).result) {
          if (!this.appModel['visibilityDef']) {
            this.appModel['visibilityDef'] = {};
          }
          this.appModel['visibilityDef']['programming-phase-component'] = (response as any).result;
        }
      });
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

  onValidateLockProgrammingPhase() {
    this.busy = true;

    this.pomService
      .canLockPom(this.programmingModel.pom, this.selectedWorkspace)
      .subscribe(
        resp => {
          const valid = (resp as any).result;
          if (valid) {
            this.lockConfirmationDlg.display = true;
          }
        },
        error => {
          this.toastService.displayError(error.error.error);
        }
      )
      .add(() => (this.busy = false));
  }

  onLockProgrammingPhase() {
    this.busy = true;
    this.selectedWorkspace.selectedFinal = true;
    this.pomService
      .lockPom(this.programmingModel.pom, this.selectedWorkspace)
      .subscribe(
        resp => {
          this.toastService.displaySuccess(
            `Programming phase for ${this.programmingModel.pom.fy} successfully locked.`
          );
          this.router.navigate(['/home']);
        },
        error => this.toastService.displayError(error.error.error),
        () => {
          this.lockConfirmationDlg.display = false;
        }
      )
      .add(() => (this.busy = false));

    this.workspaceService.updateWorkspace(this.selectedWorkspace).subscribe(
      resp => {
      },
      error => {
        this.dialogService.displayDebug(error);
      }
    );
  }

  private loadPOMData() {
    this.busy = true;
    this.pomService.getLatestPom().subscribe(
      resp => {
        this.programmingModel.pom = (resp as any).result;
        if (this.programmingModel.pom.status === PomStatus.OPEN) {
          this.pomYear = this.programmingModel.pom.fy;
          this.setupWorkspacesDropdown();
        } else {
          this.dialogService.displayDebug('POM should be in OPEN status.');
        }
      },
      error => this.dialogService.displayDebug(error)
    );
  }

  private loadData() {
    this.busy = true;
    this.programmingService
      .getPRsForContainer(this.programmingModel.pom.workspaceId, null)
      .pipe(
        switchMap(programs => {
          this.programmingModel.programs = (programs as any).result;
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

  private setupWorkspacesDropdown() {
    this.workspaceService.getByContainerIdAndActive(this.programmingModel.pom.id, true).subscribe(
      resp => {
        const workspaces = (resp as any).result;
        const items = new Array<ListItem>();
        let item: ListItem;
        for (const workspace of workspaces) {
          item = new ListItem();
          item.value = workspace.id;
          item.rawData = workspace;
          item.name = `Workspace ${workspace.version} - ${workspace.name}`;
          item.id = workspace.id;
          item.isSelected = this.containerId === workspace.id;
          if (item.isSelected) {
            this.onWorkspaceChange(item);
          }
          items.push(item);
        }
        this.workspaces = items;
      },
      error => {
        this.dialogService.displayDebug(error);
      },
      () => {
        this.busy = false;
      }
    );
  }

  onWorkspaceChange(selected: ListItem) {
    this.selectedWorkspace = selected.rawData;
    this.programmingModel.pom.workspaceId = this.selectedWorkspace.id;
    this.setupLockProgrammingPhase();
  }

  private setupLockProgrammingPhase() {
    this.loadData();
    this.loadOrganizations();
    this.setupGridster();
  }
}
