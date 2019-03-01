import { Component, OnInit, ViewChild, ChangeDetectorRef, DoCheck } from '@angular/core';
import {JHeaderComponent} from "../../header/j-header/j-header.component";
import {AllUfrsComponent} from "../ufr-search/all-ufrs/all-ufrs.component";
import {Execution, ExecutionService, Pom, POMService, UFRFilter, User} from "../../../generated";
import {UserUtils} from "../../../services/user.utils";
import {PhaseType} from "../../programming/select-program-request/UiProgramRequest";

@Component({
  selector: 'ufr-yoe-summary',
  templateUrl: './ufr-yoe-summary.component.html',
  styleUrls: ['./ufr-yoe-summary.component.scss']
})

export class UfrYoeSummaryComponent implements OnInit, DoCheck {
  @ViewChild(JHeaderComponent) header;
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
              private changeDetectorRef : ChangeDetectorRef,
              private executionService: ExecutionService) {}

  async ngOnInit() {
    this.user = await this.userUtils.user().toPromise();
    this.executionPhases = (await this.executionService.getAll().toPromise()).result;

    this.initCyclesAndEditable(this.executionPhases);
  }

  onExecutionSelection() {
    this.ufrFilter = {
      cycle: PhaseType.EXE + this.selectedExecution.fy,
      yoe: true
    };
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
