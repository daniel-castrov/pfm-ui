import { Component, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ProgrammingModel } from '../../models/ProgrammingModel';
import { RequestSummaryNavigationHistoryService } from '../requests-summary/requests-summary-navigation-history.service';
import { ScheduleComponent } from './schedule/schedule.component';
import { TabDirective } from 'ngx-bootstrap/tabs';
import { ProgrammingService } from '../../services/programming-service';
import { Program } from '../../models/Program';
import { RequestsDetailsFormComponent } from './requests-details-form/requests-details-form.component';
import { ScopeComponent } from './scope/scope.component';
import { JustificationComponent } from './justification/justification.component';
import { AssetsComponent } from './assets/assets.component';
import { VisibilityService } from 'src/app/services/visibility-service';
import { AppModel } from 'src/app/pfm-common-models/AppModel';
import { ToastService } from 'src/app/pfm-coreui/services/toast.service';
import { RequestsFundingLineGridComponent } from './requests-funding-line-grid/requests-funding-line-grid.component';

@Component({
  selector: 'pfm-requests-details',
  templateUrl: './requests-details.component.html',
  styleUrls: ['./requests-details.component.scss']
})
export class RequestsDetailsComponent implements OnInit {
  @ViewChild('detailsForm')
  requestDetailsFormComponent: RequestsDetailsFormComponent;
  @ViewChild('fundingLines')
  fundingLinesComponent: RequestsFundingLineGridComponent;
  @ViewChild('pfmSchedule')
  pfmSchedule: ScheduleComponent;
  @ViewChild('scope')
  scopeComponent: ScopeComponent;
  @ViewChild('assets')
  assetsComponent: AssetsComponent;
  @ViewChild('justification')
  justificationComponent: JustificationComponent;

  currentSelectedTab = 1;
  pomYear: number;
  program: Program;
  busy: boolean;
  disableSchedule = false;

  constructor(
    public programmingModel: ProgrammingModel,
    private programmingService: ProgrammingService,
    private route: ActivatedRoute,
    private router: Router,
    private requestSummaryNavigationHistoryService: RequestSummaryNavigationHistoryService,
    private visibilityService: VisibilityService,
    public appModel: AppModel,
    private toastService: ToastService
  ) {}

  goBack(): void {
    this.requestSummaryNavigationHistoryService.prepareNavigationHistory();
    this.router.navigate(['/programming/requests']);
  }

  ngOnInit() {
    this.programmingModel.selectedProgramId = this.route.snapshot.paramMap.get('id');
    this.pomYear = Number(this.route.snapshot.paramMap.get('pomYear'));
    this.loadProgram();
    this.setupVisibility();
  }

  async loadProgram() {
    await this.programmingService
      .getProgramById(this.programmingModel.selectedProgramId)
      .toPromise()
      .then(resp => {
        this.program = resp.result as Program;
      });
  }

  async setupVisibility() {
    await this.visibilityService
      .isCurrentlyVisible('programming-detail-component')
      .toPromise()
      .then(response => {
        this.appModel['visibilityDef']['programming-detail-component'] = (response as any).result;
      });
  }

  onApprove(): void {}

  onSave(): void {
    this.busy = true;
    let pro = this.program;
    const canSave = this.canSaveProgram(true);
    if (canSave) {
      pro = this.getFromDetailForm(pro);
      pro = this.getFromScopeForm(pro);
      pro = this.getFromAssets(pro);
      pro = this.getFromJustificationForm(pro);
      this.programmingService.save(pro).subscribe(
        resp => {
          this.busy = false;
          this.toastService.displaySuccess('Program request saved successfully.');
        },
        error => {
          this.toastService.displayError('An error has ocurred while attempting to save program.');
        }
      );
    }
  }

  private canSaveProgram(isSave: boolean) {
    const errorMessage = isSave
      ? 'Please save all rows in grids before saving the page.'
      : 'Please save row(s) currently open for editing.';
    let canSave = true;
    if (this.scopeComponent) {
      let editing = 0;
      editing += this.scopeComponent.evaluationMeasureGridApi.getEditingCells().length;
      editing += this.scopeComponent.teamLeadGridApi.getEditingCells().length;
      editing += this.scopeComponent.processPriorizationGridApi.getEditingCells().length;
      if (editing) {
        canSave = false;
        this.toastService.displayError(errorMessage, 'Scope');
      }
    }
    if (this.fundingLinesComponent) {
      let editing = 0;
      if (this.fundingLinesComponent.summaryFundingLineGridApi) {
        editing += this.fundingLinesComponent.summaryFundingLineGridApi.getEditingCells().length;
      }
      if (this.fundingLinesComponent.nonSummaryFundingLineGridApi) {
        editing += this.fundingLinesComponent.nonSummaryFundingLineGridApi.getEditingCells().length;
      }
      if (editing) {
        canSave = false;
        this.toastService.displayError(errorMessage, 'Funds');
      }
    }
    if (this.pfmSchedule) {
      if (this.pfmSchedule.gridApi.getEditingCells().length) {
        canSave = false;
        this.toastService.displayError(errorMessage, 'Schedule');
      }
    }
    if (this.assetsComponent) {
      if (this.assetsComponent.assetGridApi) {
        if (this.assetsComponent.assetGridApi.getEditingCells().length) {
          canSave = false;
          this.toastService.displayError(errorMessage, 'Assets');
        }
      }
    }
    return canSave;
  }

  onReject(): void {}

  onValidate() {
    let passedValidation = true;
    let program = { ...this.program };
    passedValidation = this.canSaveProgram(false);
    if (this.requestDetailsFormComponent) {
      program = this.getFromDetailForm(program);
      if (!program.shortName) {
        passedValidation = false;
        this.toastService.displayError('Program ID field must not be empty.', 'Program');
      }
      if (!program.longName) {
        passedValidation = false;
        this.toastService.displayError('Program Name field must not be empty.', 'Program');
      }
      if (!program.type) {
        passedValidation = false;
        this.toastService.displayError('Program Type field must not be empty.', 'Program');
      }
      if (!program.organizationId) {
        passedValidation = false;
        this.toastService.displayError('Organization field must not be empty.', 'Program');
      }
      if (
        this.requestDetailsFormComponent.showMissionPriority &&
        !this.requestDetailsFormComponent.showMissionPriorityMessage
      ) {
        if (!program.missionPriorityId) {
          passedValidation = false;
          this.toastService.displayError('Mission Priority field must not be empty.', 'Program');
        }
      }
    }
    if (passedValidation) {
      this.toastService.displaySuccess('All validations passed.');
    }
  }

  onSelectTab(event: TabDirective) {
    switch (event.heading.toLowerCase()) {
      case 'program':
        this.currentSelectedTab = 0;
        break;
      case 'funds':
        this.currentSelectedTab = 1;
        break;
      case 'schedule':
        setTimeout(() => this.pfmSchedule.drawGanttChart(true), 0);
        this.currentSelectedTab = 2;
        break;
      case 'scope':
        this.currentSelectedTab = 3;
        break;
      case 'assets':
        this.assetsComponent.getFundingLineOptions();
        this.currentSelectedTab = 4;
        break;
      case 'justification':
        this.justificationComponent.drawLineChart(true);
        this.currentSelectedTab = 5;
        break;
    }
  }

  private getFromDetailForm(program: Program): Program {
    return {
      ...program,
      shortName: this.requestDetailsFormComponent.addMode
        ? this.requestDetailsFormComponent.form.get(['shortName']).value
        : program.shortName,
      longName: this.requestDetailsFormComponent.form.get(['longName']).value,
      type: this.requestDetailsFormComponent.addMode
        ? this.requestDetailsFormComponent.form.get(['type']).value
        : program.type,
      organizationId: this.requestDetailsFormComponent.addMode
        ? this.requestDetailsFormComponent.form.get(['organizationId']).value
        : program.organizationId,
      divisionId: this.requestDetailsFormComponent.form.get(['divisionId']).value,
      missionPriorityId:
        this.requestDetailsFormComponent.showMissionPriority &&
        !this.requestDetailsFormComponent.showMissionPriorityMessage
          ? this.requestDetailsFormComponent.form.get(['missionPriorityId']).value
          : null,
      agencyPriority: this.requestDetailsFormComponent.form.get(['agencyPriority']).value,
      directoratePriority: this.requestDetailsFormComponent.form.get(['directoratePriority']).value,
      secDefLOEId: this.requestDetailsFormComponent.form.get(['secDefLOEId']).value,
      strategicImperativeId: this.requestDetailsFormComponent.form.get(['strategicImperativeId']).value,
      agencyObjectiveId: this.requestDetailsFormComponent.form.get(['agencyObjectiveId']).value
    };
  }

  private getFromScopeForm(program: Program): Program {
    return {
      ...program,
      aim: this.scopeComponent.form.get(['aim']).value,
      goal: this.scopeComponent.form.get(['goal']).value,
      quality: this.scopeComponent.form.get(['quality']).value,
      other: this.scopeComponent.form.get(['other']).value,
      attachments: [...this.scopeComponent.programAttachments]
    };
  }

  private getFromJustificationForm(program: Program): Program {
    return {
      ...program,
      justification: this.justificationComponent.form.get(['justification']).value,
      impactN: this.justificationComponent.form.get(['impactN']).value
    };
  }

  private getFromAssets(program: Program): Program {
    return {
      ...program,
      assets: this.assetsComponent.getProgramAssets()
    };
  }
}
