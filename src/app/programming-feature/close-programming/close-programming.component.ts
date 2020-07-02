import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { RequestsSummaryToaWidgetComponent } from '../requests/requests-summary/requests-summary-toa-widget/requests-summary-toa-widget.component';
import { RequestsSummaryOrgWidgetComponent } from '../requests/requests-summary/requests-summary-org-widget/requests-summary-org-widget.component';
import { GridApi } from '@ag-grid-community/all-modules';
import { ProgramSummary } from '../models/ProgramSummary';
import { IntIntMap } from '../models/IntIntMap';
import { ListItem } from '../../pfm-common-models/ListItem';
import { Organization } from '../../pfm-common-models/Organization';
import { GridsterConfig, GridsterItem } from 'angular-gridster2';
import { ProgrammingModel } from '../models/ProgrammingModel';
import { ProgrammingService } from '../services/programming-service';
import { PomService } from '../services/pom-service';
import { RoleService } from '../../services/role-service';
import { DialogService } from '../../pfm-coreui/services/dialog.service';
import { ToastService } from '../../pfm-coreui/services/toast.service';
import { Router } from '@angular/router';
import { catchError, map, switchMap } from 'rxjs/operators';
import { throwError } from 'rxjs';
import { Role } from '../../pfm-common-models/Role';
import { ListItemHelper } from '../../util/ListItemHelper';
import { PomStatus } from '../models/enumerations/pom-status.model';

@Component({
  selector: 'pfm-programming',
  templateUrl: './close-programming.component.html',
  styleUrls: ['./close-programming.component.scss']
})
export class CloseProgrammingComponent implements OnInit {
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

  closeConfirmationDlg = {
    title: 'Close POM Session',
    continueAction: null,
    display: false
  };

  constructor(
    public programmingModel: ProgrammingModel,
    private programmingService: ProgrammingService,
    private pomService: PomService,
    private roleService: RoleService,
    private dialogService: DialogService,
    private toastService: ToastService,
    private router: Router
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

  onValidateCloseProgrammingPhase() {
    this.busy = true;

    this.pomService
      .canClosePom(this.programmingModel.pom)
      .subscribe(
        resp => {
          const valid = (resp as any).result;
          if (valid) {
            this.closeConfirmationDlg.display = true;
          }
        },
        error => {
          this.toastService.displayError(error.error.error);
        }
      )
      .add(() => (this.busy = false));
  }

  onCloseProgrammingPhase() {
    this.busy = true;
    this.pomService
      .closePom(this.programmingModel.pom)
      .subscribe(
        resp => {
          this.toastService.displaySuccess(
            `Programming phase for ${this.programmingModel.pom.fy} successfully closed.`
          );
          this.router.navigate(['/home']);
        },
        error => this.toastService.displayError(error.error.error),
        () => {
          this.closeConfirmationDlg.display = false;
        }
      )
      .add(() => (this.busy = false));
  }
  onOpenProgrammingPhase() {
    this.busy = true;
    this.pomService.openPom(this.programmingModel.pom).subscribe(
      resp => {
        this.programmingModel.pom = (resp as any).result;
        this.toastService.displaySuccess(`Programming phase for ${this.programmingModel.pom.fy} successfully opened.`);
        this.router.navigate(['/home']);
      },
      error => {
        this.toastService.displayError(error.error.error);
      },
      () => (this.busy = false)
    );
  }

  private loadData() {
    this.busy = true;
    this.pomService
      .getLatestPom()
      .pipe(
        switchMap(resp => {
          this.programmingModel.pom = (resp as any).result;
          if (this.programmingModel.pom.status === PomStatus.LOCKED) {
            this.pomYear = this.programmingModel.pom.fy;
            return this.programmingService
              .getPRsForContainer(this.programmingModel.pom.id, null)
              .pipe(map(programs => (this.programmingModel.programs = (programs as any).result)));
          }
          return throwError('POM should be in LOCKED status.');
        }),
        catchError(error => {
          return throwError(error);
        })
      )
      .pipe(
        switchMap(() => {
          return this.programmingService
            .getBaBlinSummary(this.programmingModel.pom.id, null)
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
}
