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
import { ShortyType } from '../../models/enumerations/shorty-type.model';
import { UfrService } from '../../services/ufr-service';
import { catchError, switchMap } from 'rxjs/operators';
import { throwError } from 'rxjs';
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
import { RestResponse } from '../../../util/rest-response';
import { Property } from '../../models/property.model';
import { DispositionType } from '../../models/disposition-type.model';
import { UfrFundsComponent } from './ufr-funds/ufr-funds.component';

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
    private toastService: ToastService
  ) {}

  ngOnInit(): void {
    this.pomYear = Number(this.route.snapshot.paramMap.get('pomYear'));
    // TODO Remove fake implemation below. Use data required when data available. See PFM-487
    this.clickedReviewForApproval = true;

    this.selectUfrId = this.route.snapshot.paramMap.get('id');
    this.loadDispositionTypes();
    const openTab = Number(this.route.snapshot.paramMap.get('tab') ?? 1);
    this.ufrService
      .getById(this.selectUfrId)
      .pipe(
        switchMap(resp => {
          this.ufr = (resp as any).result as UFR;
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
          this.showSetDisposition =
            this.isPomCreatedOrOpen() && this.ufr.ufrStatus === UFRStatus.SAVED && this.clickedReviewForApproval;
        },
        error => {
          this.dialogService.displayDebug(error);
          // TODO This prabably should probably go when loading real data
          if (!this.ufr) {
            this.ufr = new UFR();
            this.ufr.created = new Date();
            this.ufr.modified = new Date();
            this.ufr.shortName = 'Program ID';
            this.ufr.longName = 'Program Name';
            this.ufr.type = 'PROGRAM';
            this.ufr.organizationId = '5ed7c10510f2113665b64e2c'; // JPEO-CBRND
            this.ufr.divisionId = '5ed7c10510f2113665b64e0e'; // DOD
            this.ufr.missionPriorityId = null;
            this.ufr.agencyPriority = 1;
            this.ufr.directoratePriority = 1;
            this.ufr.secDefLOEId = '5ed7c10510f2113665b64dfc'; // Improve Physical and Procedural Security
            this.ufr.strategicImperativeId = '5ed7c10510f2113665b64e03'; // Agility
            this.ufr.agencyObjectiveId = '5ed7c10510f2113665b64e07'; // Make the world safer
            this.ufr.parentId = '5ed7c4e14441f743732597a4'; // For Increment or FoS
            this.ufr.shortyType = ShortyType.MRDB_PROGRAM;
            this.ufr.originatedFrom = new UFR();
            this.ufr.originatedFrom.requestNumber = 'P21008';
            this.ufr.originatedFrom.id = '5ed7c4e14441f743732597a4';
          }
        }
      );

    this.setupVisibility();
    this.currentSelectedTab = openTab < 0 || openTab > 6 ? 1 : openTab;
  }

  private loadDispositionTypes() {
    this.propertyService
      .getByType(PropertyType.DISPOSITION_TYPE)
      .subscribe((res: RestResponse<Property<DispositionType>[]>) => {
        this.dispositionTypes = res.result.map(x => x.value).filter(x => x.phaseType === 'POM');
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

  onSave() {
    let savingUfr = this.ufr;
    const canSave = this.hasNoEditingGrids(true);
    if (canSave) {
      savingUfr = this.getFromUfrForm(savingUfr);
      savingUfr = this.getFromProgramForm(savingUfr);
      savingUfr = this.getFromScopeForm(savingUfr);
      savingUfr = this.getFromAssets(savingUfr);
      savingUfr = this.getFromJustificationForm(savingUfr);
      this.performSaveOrCreate(
        savingUfr.id ? this.ufrService.update.bind(this.ufrService) : this.ufrService.create.bind(this.ufrService),
        savingUfr
      );
    }
  }

  onSubmit() {}

  showDispositionDlg() {
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
      this.setDispositionDlg.display = false;
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
        this.currentSelectedTab = 2;
        break;
      case 'schedule':
        setTimeout(() => this.ufrSchedule.ngOnInit(), 0);
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

  private performSaveOrCreate(ufrServiceCall, ufr: UFR) {
    this.busy = true;
    ufrServiceCall(ufr)
      .subscribe(
        resp => {
          this.ufr = resp.result as UFR;
          this.toastService.displaySuccess('UFR saved successfully.');
        },
        error => {
          this.toastService.displayError('An error has ocurred while attempting to save UFR.');
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
}
