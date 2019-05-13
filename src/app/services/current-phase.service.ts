import {Budget, BudgetService, Execution, ExecutionService, Pom, POMService, RestResult} from "../generated";
import {Observable} from 'rxjs';
import {Injectable} from '@angular/core';
import {TemporaryCaching} from "./caching";
import {Subject} from "rxjs";
import {map} from 'rxjs/operators';

/**
 * Caching, performant service for the current phases/session.
 */
@Injectable({
  providedIn: 'root'
})
export class CurrentPhase {

  constructor( private pomService: POMService,
               private budgetService: BudgetService,
               private executionService: ExecutionService) {}

  @TemporaryCaching('currentPOM')
  pom(): Observable<Pom> {
    const subject = new Subject();
    (async () => {
      let poms: Pom[];
      poms = await this.pomService.getAll()
        .pipe(map( (response: RestResult) => response.result )).toPromise();
      poms = poms.sort( (a:Pom, b:Pom) => b.fy-a.fy );
      subject.next(poms[0]);
      subject.complete();
    })();
    return subject;
  }

  @TemporaryCaching('currentBudget')
  budget(): Observable<Budget> {
    const subject = new Subject();
    (async () => {
      let budgets: Budget[];
      budgets = await this.budgetService.getAll()
        .pipe(map( (response: RestResult) => response.result )).toPromise();
      budgets = budgets.sort( (a:Budget, b:Budget) => b.fy-a.fy );
      subject.next(budgets[0]);
      subject.complete();
    })();
    return subject;
  }

  @TemporaryCaching('currentExecution')
  execution(): Observable<Execution> {
    const subject = new Subject();
    (async () => {
      let executions: Execution[];
      executions = await this.executionService.getAll()
        .pipe(map( (response: RestResult) => response.result )).toPromise();
      executions = executions.sort( (a:Execution, b:Execution) => b.fy-a.fy );
      subject.next(executions[0]);
      subject.complete();
    })();
    return subject;
  }

}
