import { Component, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { PomService } from '../../services/pom-service';
import { Pom } from '../../models/Pom';
import { AppModel } from 'src/app/pfm-common-models/AppModel';
import { VisibilityService } from 'src/app/services/visibility-service';
import { DialogService } from 'src/app/pfm-coreui/services/dialog.service';
import { PomStatus } from '../../models/enumerations/pom-status.model';
import { UFR } from '../../models/ufr.model';
import { UFRStatus } from '../../models/enumerations/ufr-status.model';
import { UfrService } from '../../services/ufr-service';
import { catchError, switchMap } from 'rxjs/operators';
import { EMPTY, throwError } from 'rxjs';
import { RequestSummaryNavigationHistoryService } from '../../requests/requests-summary/requests-summary-navigation-history.service';
import { UfrScheduleComponent } from './ufr-schedule/ufr-schedule.component';
import { ToastService } from 'src/app/pfm-coreui/services/toast.service';
import { UfrFormComponent } from './ufr-form/ufr-form.component';
import { UfrProgramFormComponent } from './ufr-program-form/ufr-program-form.component';
import { UfrScopeComponent } from './ufr-scope/ufr-scope.component';
import { UfrAssetsComponent } from './ufr-assets/ufr-assets.component';
import { UfrJustificationComponent } from './ufr-justification/ufr-justification.component';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { PropertyService } from '../../services/property.service';
import { PropertyType } from '../../models/enumerations/property-type.model';
import { DispositionType } from '../../models/disposition-type.model';
import { UfrFundsComponent } from './ufr-funds/ufr-funds.component';
import { FundingLine } from '../../models/funding-line.model';
import { FundingLineService } from '../../services/funding-line.service';
import { FundingLineType } from '../../models/enumerations/funding-line-type.model';

@Component({
  selector: 'pfm-ufr-requests-detail',
  templateUrl: './ufr-requests-detail.component.html',
  styleUrls: ['./ufr-requests-detail.component.scss']
})
export class UfrRequestsDetailComponent implements OnInit {
  @ViewChild('ufrForm')
  ufrForm: UfrFormComponent;
  @ViewChild('ufrProgramForm')
  ufrProgramForm: UfrProgramFormComponent;
  @ViewChild('ufrFunds')
  ufrFunds: UfrFundsComponent;
  @ViewChild('ufrSchedule')
  ufrSchedule: UfrScheduleComponent;
  @ViewChild('ufrScope')
  ufrScope: UfrScopeComponent;
  @ViewChild('ufrAssets')
  ufrAssets: UfrAssetsComponent;
  @ViewChild('ufrJustification')
  ufrJustification: UfrJustificationComponent;

  pomYear: number;
  ufr: UFR;
  busy: boolean;
  pom: Pom;
  currentSelectedTab = 0;
  bacKToggle = true;
  showSubmitButton: boolean;
  showSaveButton: boolean;
  showSetDisposition: boolean;
  clickedReviewForApproval: boolean;
  selectUfrId: string;
  canEdit: boolean;
  editMode: boolean;

  setDispositionDlg = {
    title: 'Select Disposition',
    form: new FormGroup({
      dispositionType: new FormControl('', [Validators.required]),
      explanation: new FormControl('', [Validators.required])
    }),
    continueAction: null,
    display: false
  };
  dispositionTypes: DispositionType[];

  constructor(
    private route: ActivatedRoute,
    private pomService: PomService,
    public appModel: AppModel,
    private visibilityService: VisibilityService,
    private dialogService: DialogService,
    private router: Router,
    private ufrService: UfrService,
    private requestSummaryNavigationHistoryService: RequestSummaryNavigationHistoryService,
    private propertyService: PropertyService,
    private toastService: ToastService,
    private fundingLineService: FundingLineService
  ) {}

  ngOnInit(): void {
    this.pomYear = Number(this.route.snapshot.paramMap.get('pomYear'));
    this.selectUfrId = this.route.snapshot.paramMap.get('id');
    this.loadDispositionTypes();
    const openTab = Number(this.route.snapshot.paramMap.get('tab') ?? 1);

    this.loadUfrData();
    this.setupVisibility();
    this.currentSelectedTab = openTab < 0 || openTab > 6 ? 1 : openTab;
  }

  private loadUfrData() {
    this.ufrService
      .getById(this.selectUfrId)
      .pipe(
        switchMap(resp => {
          this.ufr = (resp as any).result as UFR;
          this.canEdit =
            (this.ufr.ufrStatus === UFRStatus.SAVED || this.ufr.ufrStatus === UFRStatus.SUBMITTED) &&
            this.ufr.createdBy === this.appModel.userDetails.cacId;
          this.editMode = history.state.editMode || false;
          this.clickedReviewForApproval = history.state.clickedReviewForApproval || false;
          return this.pomService.getPomForYear(this.pomYear);
        }),
        catchError(error => {
          return throwError(error);
        })
      )
      .subscribe(
        resp => {
          this.pom = (resp as any).result;
          this.showSaveButton =
            this.isPomCreatedOrOpen() &&
            (this.ufr.ufrStatus === UFRStatus.SAVED || this.ufr.ufrStatus === UFRStatus.SUBMITTED);
          this.showSubmitButton = this.isPomCreatedOrOpen() && this.ufr.ufrStatus === UFRStatus.SAVED;
          this.showSetDisposition = this.isPomCreatedOrOpen() && this.clickedReviewForApproval;
        },
        error => {
          this.dialogService.displayDebug(error);
        }
      );
  }

  private loadDispositionTypes() {
    this.propertyService.getByType(PropertyType.DISPOSITION_TYPE).subscribe((res: any) => {
      this.dispositionTypes = res.properties.map(x => x.value).filter(x => x.phaseType === 'POM');
    });
  }

  setupVisibility() {
    this.visibilityService
      .isCurrentlyVisible('ufr-requests-detail-component')
      .toPromise()
      .then(response => {
        this.appModel['visibilityDef']['ufr-requests-detail-component'] = (response as any).result;
      });
  }

  onSave(successMessage?: string, successCallback?: any) {
    const canSave = this.hasNoEditingGrids(true);
    if (canSave) {
      this.getFundingData().subscribe(proposedResult => {
        const proposedFundingLine = proposedResult.result as FundingLine[];
        this.ufr.proposedFundingLines = proposedFundingLine;
        let savingUfr = this.ufr;
        savingUfr = this.getFromUfrForm(savingUfr);
        savingUfr = this.getFromProgramForm(savingUfr);
        savingUfr = this.getFromScopeForm(savingUfr);
        savingUfr = this.getFromAssets(savingUfr);
        savingUfr = this.getFromJustificationForm(savingUfr);
        this.performSaveOrCreate(
          savingUfr.id ? this.ufrService.update.bind(this.ufrService) : this.ufrService.create.bind(this.ufrService),
          savingUfr,
          successMessage,
          successCallback
        );
        return true;
      });
    }
    return false;
  }

  onSubmit() {
    const canSave = this.hasNoEditingGrids(true);
    if (canSave) {
      this.getFundingData().subscribe(proposedResult => {
        const proposedFundingLine = proposedResult.result as FundingLine[];
        this.ufr.proposedFundingLines = proposedFundingLine;
        let savingUfr = this.ufr;
        savingUfr = this.getFromUfrForm(savingUfr);
        savingUfr = this.getFromProgramForm(savingUfr);
        savingUfr = this.getFromScopeForm(savingUfr);
        savingUfr = this.getFromAssets(savingUfr);
        savingUfr = this.getFromJustificationForm(savingUfr);
        this.busy = true;
        this.ufrService
          .update(savingUfr)
          .pipe(
            switchMap(resp => {
              const savedUfr = resp.result as UFR;
              if (this.validateFields(false)) {
                return this.ufrService.submit(this.ufr.id);
              }
              return EMPTY;
            })
          )
          .subscribe(resp => {
            this.ufr = resp.result as UFR;
            this.loadUfrData();
            this.toastService.displaySuccess('UFR successfully submitted.');
          })
          .add(() => (this.busy = false));
      });
    }
  }

  private validateFields(showSucessfulMessage: boolean): boolean {
    let passedValidation = true;
    let ufr = { ...this.ufr };
    if (this.ufrForm) {
      ufr = this.getFromUfrForm(ufr);
      if (!ufr.ufrName) {
        passedValidation = false;
        this.toastService.displayError('UFR Name field must not be empty.', 'UFR');
      }
      if (!ufr.notes) {
        passedValidation = false;
        this.toastService.displayError('Description field must not be empty.', 'UFR');
      }
    }
    if (this.ufrProgramForm) {
      ufr = this.getFromProgramForm(ufr);
      if (!ufr.shortName) {
        passedValidation = false;
        this.toastService.displayError('Program ID field must not be empty.', 'Program');
      }
      if (!ufr.longName) {
        passedValidation = false;
        this.toastService.displayError('Program Name field must not be empty.', 'Program');
      }
      if (!ufr.type) {
        passedValidation = false;
        this.toastService.displayError('Program Type field must not be empty.', 'Program');
      }
      if (!ufr.organizationId) {
        passedValidation = false;
        this.toastService.displayError('Organization field must not be empty.', 'Program');
      }
      if (this.ufrProgramForm.showMissionPriority && !this.ufrProgramForm.showMissionPriorityMessage) {
        if (!ufr.missionPriorityId) {
          passedValidation = false;
          this.toastService.displayError('Mission Priority field must not be empty.', 'Program');
        }
      }
    }
    if (this.ufrFunds && !this.clickedReviewForApproval) {
      if (!ufr.proposedFundingLines?.length) {
        this.toastService.displayError(
          'It seems like there are no Funding Lines in the Proposed Funding grid.' +
            'Please add a Funding Line before submitting.'
        );
        passedValidation = false;
      } else {
        for (const fundingLine of ufr.proposedFundingLines) {
          if (fundingLine.userCreated) {
            let total = 0;
            for (let i = this.pomYear; i < this.pomYear + 5; i++) {
              total += fundingLine.funds[i];
            }
            if (!total) {
              this.toastService.displayError(
                'One or more funding lines seen in the Proposed Funding grid has BY through BY+4 values' +
                  'all set to $0. Please add a requested amount or delete the funding line.'
              );
              passedValidation = false;
              break;
            }
          }
        }
      }
    }
    if (this.ufrJustification) {
      ufr = this.getFromJustificationForm(ufr);
      if (!ufr.justification) {
        passedValidation = false;
        this.toastService.displayError('Description of Change field must not be empty.', 'Justification');
      }
      if (!ufr.impactN) {
        passedValidation = false;
        this.toastService.displayError('Impact if not funded field must not be empty.', 'Justification');
      }
      if (!ufr.milestoneImpact) {
        passedValidation = false;
        this.toastService.displayError('Milestone Impact field must not be empty.', 'Justification');
      }
    }
    if (passedValidation && showSucessfulMessage) {
      this.toastService.displaySuccess('All validations passed.');
    }
    return passedValidation;
  }

  showDispositionDlg() {
    const canSave = this.hasNoEditingGrids(true);
    if (canSave) {
      let savingUfr = this.ufr;
      savingUfr = this.getFromUfrForm(savingUfr);
      savingUfr = this.getFromProgramForm(savingUfr);
      savingUfr = this.getFromScopeForm(savingUfr);
      savingUfr = this.getFromAssets(savingUfr);
      savingUfr = this.getFromJustificationForm(savingUfr);
      this.ufr = savingUfr;
      if (!this.validateFields(false)) {
        return;
      }
    } else {
      return;
    }

    this.setDispositionDlg.form.patchValue({
      dispositionType: '',
      explanation: ''
    });
    this.setDispositionDlg.form.markAsUntouched();
    this.setDispositionDlg.display = true;
  }

  onSetDisposition() {
    this.setDispositionDlg.form.markAllAsTouched();
    if (!this.setDispositionDlg.form.invalid) {
      this.ufr.disposition = this.setDispositionDlg.form.get(['dispositionType']).value;
      this.ufr.explanation = this.setDispositionDlg.form.get(['explanation']).value;
      this.busy = true;
      this.ufrService
        .disposition(this.ufr)
        .subscribe(
          resp => {
            this.toastService.displaySuccess('Disposition saved successfully.');
            this.performBackButton();
          },
          error => {
            this.toastService.displayError(error.error.error);
          }
        )
        .add(() => {
          this.setDispositionDlg.form.get('dispositionType').markAsPristine();
          this.setDispositionDlg.form.get('explanation').markAsPristine();
          this.setDispositionDlg.display = false;
          this.busy = false;
        });
    }
  }

  onSelectTab(event: any) {
    switch (event.heading.toLowerCase()) {
      case 'ufr':
        this.currentSelectedTab = 0;
        break;
      case 'program':
        this.currentSelectedTab = 1;
        break;
      case 'funds':
        setTimeout(() => this.ufrFunds.drawLineChart(true), 0);
        this.currentSelectedTab = 2;
        break;
      case 'schedule':
        setTimeout(() => {
          this.ufrSchedule.ngOnInit();
          this.onEditModeChange(this.editMode);
        }, 0);
        this.currentSelectedTab = 3;
        break;
      case 'scope':
        this.ufrScope.loadExternalInfo();
        this.currentSelectedTab = 4;
        break;
      case 'assets':
        this.ufrAssets.getFundingLineOptions();
        this.currentSelectedTab = 5;
        break;
      case 'justification':
        setTimeout(() => this.ufrJustification.loadChart(), 0);
        this.currentSelectedTab = 6;
        break;
    }
  }

  goBack() {
    /** TODO Delete bacKToggle  and implement proper validation as indicated in PFM-487 when fields and grids
     * available
     */

    if (!this.hasNoEditingGrids(false, false)) {
      this.dialogService.displayConfirmation(
        'You have unsaved data in fields or grids on one or more tabs. ' +
          'If you continue this data will be lost. ' +
          'Do you want to continue and lose this data?',
        'Caution',
        () => {
          this.performBackButton();
        },
        () => {},
        'Lose Data'
      );
    } else {
      this.performBackButton();
    }
    this.bacKToggle = !this.bacKToggle;
  }

  private hasNoEditingGrids(isSave: boolean, displayToast: boolean = true) {
    const errorMessage = isSave
      ? 'Please save all rows in grids before saving the page.'
      : 'Please save row(s) currently open for editing.';
    let canSave = true;
    if (this.ufrFunds) {
      let editing = 0;
      if (this.ufrFunds.proposedFundingLineGridApi) {
        editing += this.ufrFunds.proposedFundingLineGridApi.getEditingCells().length;
      }
      if (editing) {
        canSave = false;
        if (displayToast) {
          this.toastService.displayError(errorMessage, 'Funds');
        }
      }
    }
    if (this.ufrScope) {
      let editing = 0;
      editing += this.ufrScope.evaluationMeasureGridApi.getEditingCells().length;
      editing += this.ufrScope.teamLeadGridApi.getEditingCells().length;
      editing += this.ufrScope.processPriorizationGridApi.getEditingCells().length;
      if (editing) {
        canSave = false;
        if (displayToast) {
          this.toastService.displayError(errorMessage, 'Scope');
        }
      }
    }
    if (this.ufrSchedule) {
      if (this.ufrSchedule.gridApi.getEditingCells().length) {
        canSave = false;
        if (displayToast) {
          this.toastService.displayError(errorMessage, 'Schedule');
        }
      }
    }
    if (this.ufrAssets) {
      if (this.ufrAssets.assetGridApi) {
        if (this.ufrAssets.assetGridApi.getEditingCells().length) {
          canSave = false;
          if (displayToast) {
            this.toastService.displayError(errorMessage, 'Assets');
          }
        }
      }
    }
    return canSave;
  }

  private performBackButton() {
    this.requestSummaryNavigationHistoryService.prepareNavigationHistory();
    this.router.navigate(['/programming/ufr-requests']);
  }

  isPomCreatedOrOpen() {
    return this.pom.status === PomStatus.CREATED || this.pom.status === PomStatus.OPEN;
  }

  private performSaveOrCreate(ufrServiceCall, ufr: UFR, successMessage?: string, successCallback?: any) {
    this.busy = true;
    ufrServiceCall(ufr)
      .subscribe(
        resp => {
          this.ufr = resp.result as UFR;
          this.toastService.displaySuccess(successMessage ?? 'UFR saved successfully.');
          if (successCallback) {
            successCallback();
          }
        },
        error => {
          this.toastService.displayError('An error has occurred while attempting to save UFR.');
        }
      )
      .add(() => (this.busy = false));
  }

  private getFromUfrForm(ufr: UFR): UFR {
    return {
      ...ufr,
      ufrName: this.ufrForm.form.get(['ufrName']).value,
      notes: this.ufrForm.form.get(['notes']).value
    };
  }

  private getFromProgramForm(ufr: UFR): UFR {
    return {
      ...ufr,
      shortName: this.ufrProgramForm.form.get(['shortName']).enabled
        ? this.ufrProgramForm.form.get(['shortName']).value
        : ufr.shortName,
      longName: this.ufrProgramForm.form.get(['longName']).value,
      type: this.ufrProgramForm.form.get(['type']).enabled ? this.ufrProgramForm.form.get(['type']).value : ufr.type,
      organizationId: this.ufrProgramForm.form.get(['organizationId']).enabled
        ? this.ufrProgramForm.form.get(['organizationId']).value
        : ufr.organizationId,
      divisionId: this.ufrProgramForm.form.get(['divisionId']).value,
      missionPriorityId:
        this.ufrProgramForm.showMissionPriority && !this.ufrProgramForm.showMissionPriorityMessage
          ? this.ufrProgramForm.form.get(['missionPriorityId']).value
          : null,
      agencyPriority: this.ufrProgramForm.form.get(['agencyPriority']).value,
      directoratePriority: this.ufrProgramForm.form.get(['directoratePriority']).value,
      secDefLOEId: this.ufrProgramForm.form.get(['secDefLOEId']).value,
      strategicImperativeId: this.ufrProgramForm.form.get(['strategicImperativeId']).value,
      agencyObjectiveId: this.ufrProgramForm.form.get(['agencyObjectiveId']).value
    };
  }

  private getFundingData() {
    return this.fundingLineService.obtainFundingLinesByContainerId(this.ufr.id, FundingLineType.UFR_PROPOSED);
  }

  private getFromScopeForm(ufr: UFR): UFR {
    return {
      ...ufr,
      aim: this.ufrScope.form.get(['aim']).value,
      goal: this.ufrScope.form.get(['goal']).value,
      quality: this.ufrScope.form.get(['quality']).value,
      other: this.ufrScope.form.get(['other']).value,
      attachments: [...this.ufrScope.programAttachments]
    };
  }

  private getFromAssets(ufr: UFR): UFR {
    return {
      ...ufr,
      assets: this.ufrAssets.getProgramAssets()
    };
  }

  private getFromJustificationForm(ufr: UFR): UFR {
    return {
      ...ufr,
      justification: this.ufrJustification.form.get(['justification']).value,
      impactN: this.ufrJustification.form.get(['impactN']).value,
      milestoneImpact: this.ufrJustification.form.get(['milestoneImpact']).value
    };
  }

  onEditModeChange(editMode: boolean) {
    this.editMode = editMode;
    this.ufrForm.changeEditMode(editMode);
    this.ufrProgramForm.changeEditMode(editMode);
    this.ufrFunds.changeEditMode(editMode);
    this.ufrSchedule.changePageEditMode(editMode);
    this.ufrScope.changeEditMode(editMode);
    this.ufrAssets.changePageEditMode(editMode);
    this.ufrJustification.changeEditMode(editMode);
  }
}
