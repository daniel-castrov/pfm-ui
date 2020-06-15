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
import { UFR } from '../../models/ufr.model';
import { Pom } from '../../models/Pom';
import { WorkspaceService } from '../../services/workspace.service';
import { MrdbService } from '../../services/mrdb-service';
import { PomStatus } from '../../models/enumerations/pom-status.model';
import { UfrService } from '../../services/ufr-service';
import { AppModel } from 'src/app/pfm-common-models/AppModel';
import { switchMap, catchError } from 'rxjs/operators';
import { throwError, of } from 'rxjs';
import { ToastService } from 'src/app/pfm-coreui/services/toast.service';
import { Router } from '@angular/router';
import { formatDate } from '@angular/common';
import { ShortyType } from '../../models/enumerations/shorty-type.model';
import { DataGridMessage } from 'src/app/pfm-coreui/models/DataGridMessage';
import { ProgramType } from '../../models/enumerations/program-type.model';
import { RequestSummaryNavigationHistoryService } from '../../requests/requests-summary/requests-summary-navigation-history.service';
import { VisibilityService } from 'src/app/services/visibility-service';
import { UFRStatus } from '../../models/enumerations/ufr-status.model';
import { FundingLine } from '../../models/funding-line.model';

@Component({
  selector: 'pfm-ufr-requests-summary',
  templateUrl: './ufr-requests-summary.component.html',
  styleUrls: ['./ufr-requests-summary.component.scss']
})
export class UfrRequestsSummaryComponent implements OnInit {
  poms: ListItem[];
  busy: boolean;
  rows: UFR[] = [];
  columnDefinitions: ColDef[];
  gridApi: GridApi;
  selectedPom: ListItem;
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
  selectedShortyType: ShortyType;
  deleteDialog: DeleteDialogInterface = { title: 'Delete' };

  constructor(
    private pomService: PomService,
    private programmingService: ProgrammingService,
    private dialogService: DialogService,
    private workspaceService: WorkspaceService,
    private mrdbService: MrdbService,
    private ufrService: UfrService,
    private organizationService: OrganizationService,
    private appModel: AppModel,
    private toastService: ToastService,
    private router: Router,
    private requestSummaryNavigationHistoryService: RequestSummaryNavigationHistoryService,
    private visibilityService: VisibilityService
  ) {}

  ngOnInit() {
    this.pomService.getPomYearsByStatus(['CREATED', 'OPEN', 'LOCKED', 'CLOSED']).subscribe(resp => {
      const poms = (resp as any).result as Pom[];
      this.poms = ListItemHelper.generateListItemFromArray(poms.map(pom => ['POM ' + pom.fy, pom.id]));
      this.loadPreviousContainerSelection();
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

    this.setupVisibility()
      .pipe(
        switchMap(response => {
          this.appModel['visibilityDef']['ufr-requests-summary-component'] = (response as any).result;
          return this.pomService.getLatestPom();
        })
      )
      .subscribe(resp => {
        this.pom = (resp as any).result as Pom;
        this.showGridAddCta =
          (this.pom.status === PomStatus.CREATED || this.pom.status === PomStatus.OPEN) &&
          this.appModel['visibilityDef']['ufr-requests-summary-component']?.gridAdd;
      });
    this.infoIconMessage =
      'Only those programs that are not assigned to the Funds Requestor appear in the dropdown list.';
  }

  setupVisibility() {
    return this.visibilityService.isCurrentlyVisible('ufr-requests-summary-component');
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
        headerName: 'UFR #',
        field: 'requestNumber',
        colId: 'requestNumber',
        editable: false,
        suppressMovable: true,
        filter: false,
        sortable: false,
        suppressMenu: true,
        cellClass: 'pfm-datagrid-text pfm-datagrid-text-underline pfm-datagrid-lightgreybg',
        maxWidth: 80,
        minWidth: 80
      },
      {
        headerName: 'UFR Name',
        field: 'ufrName',
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
        field: 'shortyType',
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
        field: 'shortName',
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
        field: 'agencyPriority',
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
        field: 'ufrStatus',
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
        minWidth: 130,
        valueFormatter: params => formatDate(new Date(params.value), 'MM/d/yyyy H:mm', 'en-US')
      },
      {
        headerName: 'Created By',
        field: 'createdBy',
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
        minWidth: 140,
        valueFormatter: params => formatDate(new Date(params.value), 'MM/d/yyyy H:mm', 'en-US')
      },
      {
        headerName: 'Last Updated By',
        field: 'modifiedBy',
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
        headerName: 'Originated from UFR #',
        field: 'origin',
        colId: 'origin',
        editable: false,
        suppressMovable: true,
        filter: false,
        sortable: false,
        suppressMenu: true,
        valueGetter: ({ node }) => {
          const ufr: UFR = node.data;
          return ufr.originatedFrom ? ufr.originatedFrom.requestNumber : '';
        },
        cellClass: 'pfm-datagrid-text pfm-datagrid-text-underline pfm-datagrid-lightgreybg',
        maxWidth: 100,
        minWidth: 100
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
        maxWidth: 130,
        minWidth: 130,
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
    this.gridApi.setHeaderHeight(50);
  }

  handleGridAdd(event: any) {
    this.busy = true;
    this.showInfoIcon = false;
    this.showValidationErrors = false;
    this.selectedShortyType = null;
    switch (event.action) {
      case 'prev':
        this.selectedShortyType = ShortyType.MRDB_PROGRAM;
        this.prevFundedProgramDialog.display = true;
        this.prevFundedProgramDialog.form.reset();
        this.prevFundedProgramDialog.form.patchValue({ program: '' });
        this.mrdbService
          .getPrevFundedProgramsValidForUFR()
          .subscribe(
            resp => {
              const programs = (resp as any).result;
              this.availablePrograms = programs.sort((a, b) => a.shortName.localeCompare(b.shortName));
            },
            error => {}
          )
          .add(() => (this.busy = false));
        break;
      case 'pr':
        this.selectedShortyType = ShortyType.PR;
        this.prevFundedProgramDialog.display = true;
        this.prevFundedProgramDialog.form.reset();
        this.prevFundedProgramDialog.form.patchValue({ program: '' });
        this.showInfoIcon = true;
        this.mrdbService
          .getProgramRequestValidForUFR()
          .subscribe(
            resp => {
              const programs = (resp as any).result;
              this.availablePrograms = programs.sort((a, b) => a.shortName.localeCompare(b.shortName));
            },
            error => this.dialogService.displayDebug(error)
          )
          .add(() => (this.busy = false));
        break;
      case 'ni':
        this.selectedShortyType = ShortyType.NEW_INCREMENT;
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
          .getPRsAndMrdbPRsValidForUFR()
          .subscribe(
            resp => {
              const programs = (resp as any).result;
              this.availablePrograms = programs.sort((a, b) => a.shortName.localeCompare(b.shortName));
            },
            error => this.dialogService.displayDebug(error)
          )
          .add(() => (this.busy = false));
        break;
      case 'nfos':
        this.selectedShortyType = ShortyType.NEW_FOS;
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
          .getPRsAndMrdbPRsValidForUFR()
          .subscribe(
            resp => {
              const programs = (resp as any).result;
              this.availablePrograms = programs.sort((a, b) => a.shortName.localeCompare(b.shortName));
            },
            error => this.dialogService.displayDebug(error)
          )
          .add(() => (this.busy = false));
        break;
      case 'np':
        this.selectedShortyType = ShortyType.NEW_PROGRAM;
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
                'The program ID entered already exists on a UFR Request "' + ufr.requestNumber + '"';
              return throwError({ showValidationErrors: true });
            }
            if (this.pom.status === PomStatus.CREATED) {
              return this.programmingService.findByShortNameAndContainerId(program.shortName, this.pom.id).pipe(
                switchMap((resp2: any) => {
                  const pomProgram = resp2.result as Program;
                  if (pomProgram) {
                    return this.organizationService.getById(pomProgram.organizationId);
                  }
                  return of(undefined);
                })
              );
            }
            return of(undefined);
          }),
          switchMap((resp: any) => {
            if (resp) {
              this.shortNameErrorMessage =
                'The program ID entered already exists on the POM in the  ' +
                resp.result.abbreviation +
                ' organization.';
              return throwError({ showValidationErrors: true });
            }
            return this.workspaceService.getByProgramShortName(program.shortName);
          }),
          switchMap(resp => {
            const workspaces = (resp as any).result;
            if (workspaces?.length) {
              this.shortNameErrorMessage =
                'The program ID entered already exists on Workspace(s)  ' +
                workspaces.map(w => 'ID ' + w.version).join(', ') +
                '.';
              return throwError({ showValidationErrors: true });
            }
            const ufr = {
              shortName: this.createProgramDialog.form.get(['shortName']).value,
              longName: this.createProgramDialog.form.get(['longName']).value,
              organizationId: this.createProgramDialog.form.get(['organizationId']).value,
              containerId: this.selectedPom.value,
              shortyType: this.selectedShortyType,
              type: ProgramType.PROGRAM
            } as UFR;
            return this.ufrService.create(ufr);
          }),
          catchError(error => {
            if (error?.showValidationErrors) {
              this.showValidationErrors = error.showValidationErrors;
            } else {
              this.dialogService.displayDebug(error);
            }
            return of();
          })
        )
        .subscribe(
          resp => {
            const resultUFR = resp.result as UFR;
            this.toastService.displaySuccess('UFR saved successfully.');
            this.router.navigate([
              '/programming/ufr-requests/details/' + resultUFR.id,
              {
                pomYear: this.pom.fy,
                tab: 0
              }
            ]);
          },
          error => {
            this.toastService.displayError('An error has occurred while attempting to save UFR.');
          }
        )
        .add(() => (this.busy = false));
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
    this.showValidationErrors = false;
    if (this.prevFundedProgramDialog.form.valid) {
      const program = {
        id: this.prevFundedProgramDialog.form.get(['program']).value
      } as Program;
      let ufr = {} as UFR;
      this.busy = true;
      let loadProgramById;
      if (this.selectedShortyType === ShortyType.MRDB_PROGRAM) {
        loadProgramById = this.mrdbService.getById(program.id);
      } else {
        loadProgramById = this.programmingService.getProgramById(program.id);
      }
      loadProgramById
        .pipe(
          switchMap((resp: any) => {
            const validateProgram = resp.result as Program;
            ufr = {
              shortName: validateProgram.shortName,
              longName: validateProgram.longName,
              organizationId: validateProgram.organizationId,
              containerId: this.selectedPom.value,
              shortyType: this.selectedShortyType,
              type: ProgramType.PROGRAM
            } as UFR;
            if (this.selectedShortyType === ShortyType.PR) {
              ufr.proposedFundingLines = [];
              validateProgram.fundingLines.forEach(fundingLine => {
                const proposedFundingLine: FundingLine = {};
                proposedFundingLine.appropriation = fundingLine.appropriation;
                proposedFundingLine.baOrBlin = fundingLine.baOrBlin;
                proposedFundingLine.sag = fundingLine.sag;
                proposedFundingLine.wucd = fundingLine.wucd;
                proposedFundingLine.expenditureType = fundingLine.expenditureType;
                proposedFundingLine.ctc = fundingLine.ctc;
                proposedFundingLine.userCreated = fundingLine.userCreated;
                const funds: { [key: string]: number } = {};
                for (let i = this.pom.fy; i < this.pom.fy + 5; i++) {
                  funds[i] = 0;
                }
                proposedFundingLine.funds = funds;
                ufr.proposedFundingLines.push(proposedFundingLine);
              });
            }
            return this.ufrService.getByProgramShortName(ufr.shortName);
          }),
          switchMap((resp: any) => {
            const existingUfr = resp.result as UFR;
            if (existingUfr) {
              this.shortNameErrorMessage =
                'The program ID entered already exists on a UFR Request "' + existingUfr.requestNumber + '"';
              return throwError({ showValidationErrors: true });
            }
            return this.ufrService.create(ufr);
          }),
          catchError(error => {
            if (error?.showValidationErrors) {
              this.showValidationErrors = error.showValidationErrors;
            } else {
              this.dialogService.displayDebug(error);
            }
            return of();
          })
        )
        .subscribe(
          resp => {
            const resultUFR = resp.result as UFR;
            this.toastService.displaySuccess('UFR saved successfully.');
            this.router.navigate([
              '/programming/ufr-requests/details/' + resultUFR.id,
              {
                pomYear: this.pom.fy,
                tab: 0
              }
            ]);
          },
          error => {
            this.toastService.displayError('An error has occurred while attempting to save UFR.');
          }
        )
        .add(() => (this.busy = false));
    } else {
      this.showValidationErrors = true;
    }
  }

  onCreateNewUFRAction() {
    this.showValidationErrors = false;
    if (this.createNewIncOrFosDialog.form.valid) {
      let program: Program;
      const programId = this.createNewIncOrFosDialog.form.get(['program']).value;
      const shortName = this.createNewIncOrFosDialog.form.get(['shortName']).value;
      const longName = this.createNewIncOrFosDialog.form.get(['longName']).value;
      this.busy = true;
      this.mrdbService
        .getById(programId)
        .pipe(
          switchMap(resp => {
            const previousProgram = resp.result;
            if (previousProgram) {
              program = previousProgram;
              return of(null);
            } else {
              return this.programmingService.getProgramById(programId);
            }
          }),
          switchMap(resp => {
            if (resp) {
              const activeProgram = resp.result;
              program = activeProgram;
            }
            return this.mrdbService.getByName(shortName);
          }),
          switchMap(resp => {
            if ((resp as any).result) {
              this.shortNameErrorMessage =
                'The program ID entered already exists as a previously funded program. ' +
                'Please cancel out of this and click the + button to add a Previously Funded Program.';
              return throwError({ showValidationErrors: true });
            }
            return this.ufrService.getByProgramShortName(shortName);
          }),
          switchMap((resp: any) => {
            const ufr = resp.result as UFR;
            if (ufr) {
              this.shortNameErrorMessage =
                'The program ID entered already exists on a UFR Request "' + ufr.requestNumber + '"';
              return throwError({ showValidationErrors: true });
            }
            if (this.pom.status === PomStatus.CREATED) {
              return this.programmingService.findByShortNameAndContainerId(shortName, this.pom.id).pipe(
                switchMap((resp2: any) => {
                  const pomProgram = resp2.result as Program;
                  if (pomProgram) {
                    return this.organizationService.getById(pomProgram.organizationId);
                  }
                  return of(undefined);
                })
              );
            }
            return of(undefined);
          }),
          switchMap((resp: any) => {
            if (resp) {
              this.shortNameErrorMessage =
                'The program ID entered already exists on the POM in the  ' +
                resp.result.abbreviation +
                ' organization.';
              return throwError({ showValidationErrors: true });
            }
            return this.workspaceService.getByProgramShortName(shortName);
          }),
          switchMap(resp => {
            const workspaces = (resp as any).result;
            if (workspaces?.length) {
              this.shortNameErrorMessage =
                'The program ID entered already exists on Workspace(s)  ' +
                workspaces.map(w => 'ID ' + w.version).join(', ') +
                '.';
            }
            const ufr = {
              shortName,
              longName,
              organizationId: program.organizationId,
              containerId: this.selectedPom.value,
              shortyType: this.selectedShortyType,
              parentId: program.id,
              type: this.selectedShortyType === ShortyType.NEW_FOS ? ProgramType.FOS : ProgramType.INCREMENT
            } as UFR;
            return this.ufrService.create(ufr);
          })
        )
        .subscribe(
          resp => {
            const resultUFR = resp.result as UFR;
            this.toastService.displaySuccess('UFR saved successfully.');
            this.router.navigate([
              '/programming/ufr-requests/details/' + resultUFR.id,
              {
                pomYear: this.pom.fy,
                tab: 0
              }
            ]);
          },
          (error: any) => {
            if (error?.showValidationErrors) {
              this.showValidationErrors = error.showValidationErrors;
            } else {
              this.dialogService.displayDebug(error);
            }
          }
        )
        .add(() => (this.busy = false));
    } else {
      this.showValidationErrors = true;
    }
  }

  onPomChanged(pomYear: ListItem) {
    this.selectedPom = pomYear;
    this.requestSummaryNavigationHistoryService.updateRequestSummaryNavigationHistory({
      selectedContainer: this.selectedPom.value
    });
    this.ufrService.getByContainerId(this.selectedPom.value).subscribe(resp => {
      const ufrs = resp.result as UFR[];
      ufrs.forEach(ufr => (ufr.action = this.getActionState(ufr)));
      this.rows = ufrs;
    });
  }

  onParentProgramChanged(event: any) {
    this.SelectedProgram = this.availablePrograms.find(p => p.id === event.target.value);
    this.createNewIncOrFosDialog.form.get('organizationId').patchValue(this.SelectedProgram.organizationId);
  }

  handleCellAction(cellAction: DataGridMessage) {
    switch (cellAction.message) {
      case 'cellClicked':
        if (cellAction.columnId === 'requestNumber') {
          this.columnDetailClicked(this.rows[cellAction.rowIndex].id);
        } else if (cellAction.columnId === 'origin' && this.rows[cellAction.rowIndex].originatedFrom) {
          this.columnDetailClicked(this.rows[cellAction.rowIndex].originatedFrom.id);
        }
        break;
      case 'delete':
        this.deleteDialog.bodyText = 'Are you sure you want to delete?';
        this.displayDeleteDialog(cellAction, this.deleteRow.bind(this));
        break;
      case 'review':
        // TODO implement actions here
        break;
    }
  }

  columnDetailClicked(ufrId: string) {
    this.router.navigate([
      '/programming/ufr-requests/details/' + ufrId,
      {
        pomYear: this.pom.fy,
        tab: 0
      }
    ]);
  }

  private deleteRow(rowIndex: number) {
    const ufr = this.rows[rowIndex];
    if (ufr.id) {
      this.ufrService.remove(ufr.id).subscribe(
        () => {
          this.rows.splice(rowIndex, 1);

          this.gridApi.setRowData(this.rows);
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

  loadPreviousContainerSelection() {
    const selectedContainer = this.requestSummaryNavigationHistoryService.getSelectedContainer();
    if (selectedContainer) {
      const listItem = this.poms.find(p => p.value === selectedContainer);
      listItem.isSelected = true;
      this.onPomChanged(listItem);
    }
  }

  getActionState(ufr: UFR) {
    const canReview =
      this.appModel['visibilityDef']['ufr-requests-summary-component']?.canReview &&
      ufr.ufrStatus === UFRStatus.SUBMITTED &&
      !ufr.disposition;
    const canDeleteSingle =
      ufr.createdBy === this.appModel.userDetails.cacId &&
      (ufr.ufrStatus === UFRStatus.SAVED || ufr.ufrStatus === UFRStatus.SUBMITTED) &&
      !ufr.disposition;
    return { canReview, canDeleteSingle };
  }
}

export interface DeleteDialogInterface {
  title: string;
  bodyText?: string;
  display?: boolean;
  cellAction?: DataGridMessage;
  delete?: (rowIndex: number) => void;
}
