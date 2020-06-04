import { Component, OnInit } from '@angular/core';
import { ListItem } from 'src/app/pfm-common-models/ListItem';
import { ListItemHelper } from 'src/app/util/ListItemHelper';
import { ColDef, GridApi } from '@ag-grid-community/all-modules';
import { UfrActionCellRendererComponent } from 'src/app/pfm-coreui/datagrid/renderers/ufr-action-cell-renderer/ufr-action-cell-renderer.component';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { DialogService } from 'src/app/pfm-coreui/services/dialog.service';
import { Organization } from 'src/app/pfm-common-models/Organization';
import { OrganizationService } from 'src/app/services/organization-service';
import { PomService } from '../../services/pom-service';
import { ProgrammingService } from '../../services/programming-service';
import { Program } from '../../models/Program';
import { Pom } from '../../models/Pom';
import { WorkspaceService } from '../../services/workspace.service';
import { MrdbService } from '../../services/mrdb-service';
import { PomStatus } from '../../models/enumerations/pom-status.model';
import { UfrService } from '../../services/ufr-service';
import { AppModel } from 'src/app/pfm-common-models/AppModel';
import { RoleConstants } from 'src/app/pfm-common-models/role-contants.model';
import { switchMap } from 'rxjs/operators';
import { throwError, of } from 'rxjs';
import { UFR } from '../../models/ufr.model';

@Component({
  selector: 'pfm-ufr-requests-summary',
  templateUrl: './ufr-requests-summary.component.html',
  styleUrls: ['./ufr-requests-summary.component.scss']
})
export class UfrRequestsSummaryComponent implements OnInit {
  years: ListItem[];
  busy: boolean;
  rows: any[] = [];
  columnDefinitions: ColDef[];
  gridApi: GridApi;
  selectedYear: ListItem;
  gridAddOptions: ListItem[];
  createProgramDialog: any;
  prevFundedProgramDialog: any;
  createNewIncOrFosDialog: any;
  orgs: Organization[];
  selectedOrg: ListItem;
  availablePrograms: Program[];
  shortNameErrorMessage: string;
  pom: Pom;
  SelectedProgram: Program;
  showInfoIcon: boolean;
  infoIconMessage: string;
  showValidationErrors: boolean;
  showGridAddCta: boolean;

  constructor(
    private pomService: PomService,
    private programmingService: ProgrammingService,
    private dialogService: DialogService,
    private workspaceService: WorkspaceService,
    private mrdbService: MrdbService,
    private ufrService: UfrService,
    private organizationService: OrganizationService,
    private appModel: AppModel
  ) {}

  ngOnInit() {
    this.pomService.getPomYearsByStatus(['CREATED', 'OPEN', 'LOCKED', 'CLOSED']).subscribe(resp => {
      const years = (resp as any).result;
      this.years = ListItemHelper.generateListItemFromArray(years.map(y => ['POM ' + y, y.toString()]));
    });

    this.selectedOrg = {
      id: 'Select',
      name: 'Select',
      value: 'Select',
      isSelected: false,
      rawData: 'Select'
    };
    this.setupGrid();
    this.setupOrgDropDown();
    this.setupForms();

    this.pomService.getLatestPom().subscribe(resp => {
      this.pom = (resp as any).result as Pom;
      this.showGridAddCta =
        (this.pom.status === PomStatus.CREATED || this.pom.status === PomStatus.OPEN) &&
        (this.appModel.userDetails.roles.includes(RoleConstants.POM_MANAGER) ||
          this.appModel.userDetails.roles.includes(RoleConstants.FINANCIAL_MANAGER));
    });
    this.infoIconMessage =
      'Only those programs that are not assigned to the Funds Requestor appear in the dropdown list.';
  }

  private setupGrid() {
    this.gridAddOptions = ListItemHelper.generateListItemFromArray([
      ['Previously Funded Program', 'prev', 'prev'],
      ['Program Request', 'pr', 'pr'],
      ['New Increment', 'ni', 'ni'],
      ['New FoS', 'nfos', 'nfos'],
      ['New Program', 'np', 'np']
    ]);

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
        cellRendererFramework: UfrActionCellRendererComponent
      }
    ];
  }

  private setupForms() {
    this.createProgramDialog = {
      title: 'Add New Program',
      form: new FormGroup({
        shortName: new FormControl('', [Validators.required]),
        longName: new FormControl('', [Validators.required]),
        organizationId: new FormControl('', [Validators.required])
      }),
      display: false
    };
    this.prevFundedProgramDialog = {
      title: 'Select a Program',
      form: new FormGroup({
        program: new FormControl('', [Validators.required])
      }),
      display: false
    };

    this.createNewIncOrFosDialog = {
      title: 'Add UFR Program',
      form: new FormGroup({
        program: new FormControl('', [Validators.required]),
        shortName: new FormControl('', [Validators.required]),
        longName: new FormControl('', [Validators.required]),
        organizationId: new FormControl({ value: '', disabled: true }, [Validators.required])
      }),
      display: false
    };
  }

  onGridIsReady(gridApi: GridApi) {
    this.gridApi = gridApi;
    this.rows = [];
  }

  handleGridAdd(event: any) {
    this.busy = true;
    this.showInfoIcon = false;
    this.showValidationErrors = false;
    switch (event.action) {
      case 'prev': {
        this.prevFundedProgramDialog.display = true;
        this.prevFundedProgramDialog.form.reset();
        this.prevFundedProgramDialog.form.patchValue({ program: '' });
        this.mrdbService
          .getPrevFundedProgramsValidForUFR()
          .subscribe(
            resp => {
              this.availablePrograms = (resp as any).result;
            },
            error => {}
          )
          .add(() => (this.busy = false));
        break;
      }
      case 'pr': {
        this.prevFundedProgramDialog.display = true;
        this.prevFundedProgramDialog.form.reset();
        this.prevFundedProgramDialog.form.patchValue({ program: '' });
        this.showInfoIcon = true;
        this.mrdbService
          .getProgramRequestValidForURF()
          .subscribe(
            resp => {
              this.availablePrograms = (resp as any).result;
            },
            error => this.dialogService.displayDebug(error)
          )
          .add(() => (this.busy = false));
        break;
      }
      case 'ni': {
        this.shortNameErrorMessage = null;
        this.createNewIncOrFosDialog.form.reset();
        this.createNewIncOrFosDialog.title = 'Add UFR for New Increment';
        this.createNewIncOrFosDialog.form.patchValue({
          program: '',
          shortName: '',
          longName: '',
          organizationId: ''
        });
        this.createNewIncOrFosDialog.display = true;
        this.showInfoIcon = true;
        this.mrdbService
          .getPRsAndMrdbPRsValidForURF()
          .subscribe(
            resp => {
              this.availablePrograms = (resp as any).result;
            },
            error => this.dialogService.displayDebug(error)
          )
          .add(() => (this.busy = false));
        break;
      }
      case 'nfos': {
        this.shortNameErrorMessage = null;
        this.createNewIncOrFosDialog.form.reset();
        this.createNewIncOrFosDialog.title = 'Add UFR for New FoS';
        this.createNewIncOrFosDialog.display = true;
        this.createNewIncOrFosDialog.form.patchValue({
          program: '',
          shortName: '',
          longName: '',
          organizationId: ''
        });
        this.showInfoIcon = true;
        this.mrdbService
          .getPRsAndMrdbPRsValidForURF()
          .subscribe(
            resp => {
              this.availablePrograms = (resp as any).result;
            },
            error => this.dialogService.displayDebug(error)
          )
          .add(() => (this.busy = false));
        break;
      }
      case 'np': {
        this.createProgramDialog.form.reset();
        this.createProgramDialog.form.patchValue({
          shortName: '',
          longName: '',
          organizationId: ''
        });
        this.createProgramDialog.display = true;
        this.busy = false;
        break;
      }
    }
  }

  setupOrgDropDown() {
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

  onCreateProgramAction() {
    this.showValidationErrors = false;
    if (this.createProgramDialog.form.valid) {
      const program = {
        shortName: this.createProgramDialog.form.get(['shortName']).value,
        longName: this.createProgramDialog.form.get(['longName']).value,
        organizationId: this.createProgramDialog.form.get(['organizationId']).value
      } as Program;
      this.mrdbService
        .getByName(program.shortName)
        .pipe(
          switchMap(resp => {
            if ((resp as any).result) {
              this.shortNameErrorMessage =
                'The program ID entered already exists as a previously funded program. ' +
                'Please cancel out of this and click the + button to add a Previously Funded Program.';
              return throwError({ showValidationErrors: true });
            }
            return this.ufrService.getByProgramShortName(program.shortName);
          }),
          switchMap((resp: any) => {
            const ufr = resp.result as UFR;
            if (ufr) {
              this.shortNameErrorMessage =
                'The program ID entered already exists on a UFR Request "' + ufr.ufrName + '"';
              return throwError({ showValidationErrors: true });
            }
            return this.pom.status === PomStatus.CREATED
              ? this.programmingService.findByShortNameAndContainerId(this.pom.id, program.shortName)
              : of({ result: null });
          }),
          switchMap((resp: any) => {
            const pomProgram = resp.result as Program;
            if (pomProgram) {
              this.organizationService.getById(pomProgram.organizationId).subscribe(orgResp => {
                this.shortNameErrorMessage =
                  'The program ID entered already exists on the POM in the  ' +
                  orgResp.result.abbreviation +
                  ' organization.';
                return throwError({ showValidationErrors: true });
              });
              return this.workspaceService.getByProgramShortName(program.shortName);
            }
          }),
          switchMap(resp => {
            const workspaces = (resp as any).result;
            if (workspaces?.length) {
              this.shortNameErrorMessage =
                'The program ID entered already exists on Workspace(s)  ' +
                workspaces.map(w => 'ID ' + w.version).join(', ') +
                '.';
            }
            return of();
          })
        )
        .subscribe(
          () => {},
          (error: any) => {
            if (error?.showValidationErrors) {
              this.showValidationErrors = error.showValidationErrors;
            } else {
              this.dialogService.displayDebug(error);
            }
          }
        );
    } else {
      this.showValidationErrors = true;
    }
  }

  checkValidationCreateProgram(controlName: string, errorName: string) {
    return this.createProgramDialog.form.get(controlName).hasError(errorName) && this.showValidationErrors;
  }

  checkValidationPrevFundedProgram(controlName: string, errorName: string) {
    return this.prevFundedProgramDialog.form.get(controlName).hasError(errorName) && this.showValidationErrors;
  }

  checkValidationNewUFR(controlName: string, errorName: string) {
    return this.createNewIncOrFosDialog.form.get(controlName).hasError(errorName) && this.showValidationErrors;
  }

  onImportProgram() {
    if (this.prevFundedProgramDialog.form.valid) {
    } else {
      this.showValidationErrors = true;
    }
  }

  onCreateNewUFRAction() {
    this.showValidationErrors = false;
    if (this.createNewIncOrFosDialog.form.valid) {
      this.mrdbService
        .getByName(this.SelectedProgram.shortName)
        .pipe(
          switchMap(resp => {
            if ((resp as any).result) {
              this.shortNameErrorMessage =
                'The program ID entered already exists as a previously funded program. ' +
                'Please cancel out of this and click the + button to add a Previously Funded Program.';
              return throwError({ showValidationErrors: true });
            }
            return this.ufrService.getByProgramShortName(this.SelectedProgram.shortName);
          }),
          switchMap((resp: any) => {
            const ufr = resp.result as UFR;
            if (ufr) {
              this.shortNameErrorMessage =
                'The program ID entered already exists on a UFR Request "' + ufr.ufrName + '"';
              return throwError({ showValidationErrors: true });
            }
            return this.pom.status === PomStatus.CREATED
              ? this.programmingService.findByShortNameAndContainerId(this.pom.id, this.SelectedProgram.shortName)
              : of({ result: null });
          }),
          switchMap((resp: any) => {
            const pomProgram = resp.result as Program;
            if (pomProgram) {
              this.organizationService.getById(pomProgram.organizationId).subscribe(orgResp => {
                this.shortNameErrorMessage =
                  'The program ID entered already exists on the POM in the  ' +
                  orgResp.result.abbreviation +
                  ' organization.';
                return throwError({ showValidationErrors: true });
              });
              return this.workspaceService.getByProgramShortName(this.SelectedProgram.shortName);
            }
          }),
          switchMap(resp => {
            const workspaces = (resp as any).result;
            if (workspaces?.length) {
              this.shortNameErrorMessage =
                'The program ID entered already exists on Workspace(s)  ' +
                workspaces.map(w => 'ID ' + w.version).join(', ') +
                '.';
            }
            return of();
          })
        )
        .subscribe(
          () => {},
          (error: any) => {
            if (error?.showValidationErrors) {
              this.showValidationErrors = error.showValidationErrors;
            } else {
              this.dialogService.displayDebug(error);
            }
          }
        );
    } else {
      this.showValidationErrors = true;
    }
  }

  onYearChanged(year: ListItem) {
    this.selectedYear = year;
  }

  onParentProgramChanged(event: any) {
    this.SelectedProgram = this.availablePrograms.find(p => p.id === event.target.value);
    this.createNewIncOrFosDialog.form.get('organizationId').patchValue(this.SelectedProgram.organizationId);
  }
}
