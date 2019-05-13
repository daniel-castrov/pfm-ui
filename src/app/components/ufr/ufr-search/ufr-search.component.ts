import {AllUfrsComponent} from './all-ufrs/all-ufrs.component';
import {UserUtils} from '../../../services/user.utils';
import {ChangeDetectorRef, Component, DoCheck, OnInit, ViewChild} from '@angular/core';
import {Budget, BudgetService, ExecutionService, Pom, POMService, RestResult, UFRFilter, UfrStatus, User} from '../../../generated';
import {Cycle} from '../cycle';
import {CurrentPhase} from '../../../services/current-phase.service';
import {PhaseType} from '../../programming/select-program-request/UiProgramRequest';
import {forkJoin} from 'rxjs/internal/observable/forkJoin';

@Component({
  selector: 'app-ufr-search',
  templateUrl: './ufr-search.component.html',
  styleUrls: ['./ufr-search.component.scss']
})
export class UfrSearchComponent implements OnInit, DoCheck {

  @ViewChild(AllUfrsComponent) allUfrsComponent: AllUfrsComponent;
  private user: User;
  private cycles: string[] = [];
  private mapCycleIdToFy = new Map<string, string>();
  pom: Pom;
  ufrFilter: UFRFilter;
  PhaseType = PhaseType;

  constructor(private userUtils: UserUtils,
              private pomService: POMService,
              private budgetService: BudgetService,
              private executionService: ExecutionService,
              private changeDetectorRef : ChangeDetectorRef,
              private currentPhase: CurrentPhase) {}

  async ngOnInit() {
    this.user = await this.userUtils.user().toPromise();
    this.pom = (await this.currentPhase.pom().toPromise());
    this.ufrFilter = {
      cycle: 'POM' + this.pom.fy,
      yoe: false,
      status: [UfrStatus.SAVED, UfrStatus.SUBMITTED]
    };

    const [poms, budgets] = (await forkJoin([
      this.pomService.getAll(),
      this.budgetService.getAll()])
      .toPromise()).map( (restResult: RestResult) => restResult.result) as [Pom[], Budget[]];

    this.initCyclesAndEditable(poms, budgets);
  }

  ngDoCheck() {
    this.changeDetectorRef.detectChanges();
  }

  private initCyclesAndEditable(poms: Pom[], budgets: Budget[]) {
    const phases: Cycle[] = [];

    poms.forEach((pom: Pom) => {
      phases.push({ fy: pom.fy, phase: PhaseType.POM });
      this.mapCycleIdToFy.set(pom.workspaceId, PhaseType.POM + ' ' + pom.fy);
    });

    budgets.forEach(budget => {
      phases.push({ fy: budget.fy, phase: PhaseType.PB });
    });

    phases.sort((cycle1: Cycle, cycle2: Cycle) => {
      if (cycle1.fy === cycle2.fy) {
        if (cycle1.phase === cycle2.phase) {
          return 0;
        }
        return (cycle1.phase < cycle2.phase ? -1 : 1);
      }
      else {
        return cycle1.fy - cycle2.fy;
      }
    });
    phases.forEach((cycle: Cycle) => {
      this.cycles.push(cycle.phase + ' ' + (cycle.fy - 2000));
    });
  }
}
