import { Component, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ProgrammingModel } from '../../models/ProgrammingModel';
import { RequestSummaryNavigationHistoryService } from '../requests-summary/requests-summary-navigation-history.service';
import { ScheduleComponent } from './schedule/schedule.component';
import { TabDirective } from 'ngx-bootstrap';
import { ProgrammingService } from '../../services/programming-service';
import { Program } from '../../models/Program';
import { RequestsDetailsFormComponent } from './requests-details-form/requests-details-form.component';
import { ProgramStatus } from '../../models/enumerations/program-status.model';
import { ScopeComponent } from './scope/scope.component';
import { JustificationComponent } from './justification/justification.component';
import { AssetsComponent } from './assets/assets.component';

@Component({
  selector: 'pfm-requests-details',
  templateUrl: './requests-details.component.html',
  styleUrls: ['./requests-details.component.scss']
})

export class RequestsDetailsComponent implements OnInit {

  @ViewChild('pfmSchedule', { static: false })
  pfmSchedule: ScheduleComponent;
  @ViewChild('detailsForm', { static: false })
  requestDetailsFormComponent: RequestsDetailsFormComponent;
  @ViewChild('scope', { static: false })
  scopeComponent: ScopeComponent;
  @ViewChild('justification', { static: false })
  justificationComponent: JustificationComponent;
  @ViewChild('assets', { static: false })
  assetsComponent: AssetsComponent;

  currentSelectedTab = 1;
  pomYear: number;
  program: Program;
  busy: boolean;

  constructor(
    public programmingModel: ProgrammingModel,
    private programmingService: ProgrammingService,
    private route: ActivatedRoute,
    private router: Router,
    private requestSummaryNavigationHistoryService: RequestSummaryNavigationHistoryService
  ) {
  }

  goBack(): void {
    this.requestSummaryNavigationHistoryService.prepareNavigationHistory();
    this.router.navigate(['/programming/requests']);
  }

  async ngOnInit() {
    this.programmingModel.selectedProgramId = this.route.snapshot.paramMap.get('id');
    await this.programmingService.getProgramById(this.programmingModel.selectedProgramId)
      .toPromise()
      .then(resp => {
        this.program = (resp.result) as Program;
      });
    this.pomYear = Number(this.route.snapshot.paramMap.get('pomYear'));
  }

  onApprove(): void {
    console.log('Approve Organization');
  }

  onSave(): void {
    this.busy = true;
    let pro = this.program;
    if (this.requestDetailsFormComponent) {
      pro = this.getFromDetailForm(pro);
    }
    if (this.scopeComponent) {
      pro = this.getFromScopeForm(pro);
    }
    if (this.justificationComponent) {
      pro = this.getFromJustificationForm(pro);
    }
    pro.programStatus = ProgramStatus.SAVED;
    this.programmingService.updateProgram(pro).subscribe(resp => {
      this.busy = false;
    });
  }

  onReject(): void {
    console.log('Reject Organization');
  }

  onValidate(): void {
    console.log('Validate Organization');
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
      longName: this.requestDetailsFormComponent.form.get(['longName']).value,
      divisionId: this.requestDetailsFormComponent.form.get(['divisionId']).value,
      missionPriorityId: this.requestDetailsFormComponent.form.get(['missionPriorityId']).value,
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
}
