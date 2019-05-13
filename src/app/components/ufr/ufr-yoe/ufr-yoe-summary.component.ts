import {ChangeDetectorRef, Component, DoCheck, OnInit, ViewChild} from '@angular/core';
import {AllUfrsComponent} from '../ufr-search/all-ufrs/all-ufrs.component';
import {Execution, ExecutionService, POMService, UFRFilter, User} from '../../../generated';
import {UserUtils} from '../../../services/user.utils';
import {PhaseType} from '../../programming/select-program-request/UiProgramRequest';
import {SessionUtil} from '../../../utils/SessionUtil';

@Component({
  selector: 'ufr-yoe-summary',
  templateUrl: './ufr-yoe-summary.component.html',
  styleUrls: ['./ufr-yoe-summary.component.scss']
})

export class UfrYoeSummaryComponent implements OnInit, DoCheck {
  @ViewChild(AllUfrsComponent) allUfrsComponent: AllUfrsComponent;

  executionPhases: Execution[];
  selectedExecution: Execution;
  user: User;
  mapCycleIdToFy = new Map<string, string>();
  execution: Execution;
  ufrFilter: UFRFilter;
  PhaseType = PhaseType;

  constructor(private userUtils: UserUtils,
              private pomService: POMService,
              private changeDetectorRef: ChangeDetectorRef,
              private executionService: ExecutionService) {}

  async ngOnInit() {
    this.user = await this.userUtils.user().toPromise();
    this.executionPhases = (await this.executionService.getAll().toPromise()).result;
    if (this.executionPhases.length > 0) {
      if (SessionUtil.get('execution')) {
        this.selectedExecution = this.executionPhases.find(e => e.fy === SessionUtil.get('execution').fy);
      } else {
        this.selectedExecution = this.executionPhases[0];
        SessionUtil.set('execution', this.selectedExecution);
      }
      this.ufrFilter = {
        cycle: PhaseType.EXE + this.selectedExecution.fy,
        yoe: true
      };
    }
    this.initCyclesAndEditable(this.executionPhases);
  }

  onExecutionSelection() {
    this.ufrFilter = {
      cycle: PhaseType.EXE + this.selectedExecution.fy,
      yoe: true
    };
    SessionUtil.set('execution', this.selectedExecution);
  }

  ngDoCheck() {
    this.changeDetectorRef.detectChanges();
  }

  private initCyclesAndEditable(executions: Execution[]) {
    executions.forEach((execution: Execution) => {
      this.mapCycleIdToFy.set(execution.id, 'EXE ' + execution.fy);
    });
  }
}
