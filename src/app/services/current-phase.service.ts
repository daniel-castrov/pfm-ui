import {Budget, BudgetService, Pom, POMService, RestResult, User} from "../generated";
import {Observable} from 'rxjs/Observable';
import {Injectable} from '@angular/core';
import 'rxjs/add/operator/map'
import {TemporaryCaching} from "./caching";
import {UserUtils} from "./user.utils";
import {Subject} from "rxjs";

/**
 * Caching, performant service for the current phases/session.
 */
@Injectable()
export class CurrentPhase {

  constructor( private userUtils: UserUtils,
               private pomService: POMService,
               private budgetService: BudgetService ) {}


  @TemporaryCaching('currentPOM')
  pom(): Observable<Pom> {
    const subject = new Subject();
    (async () => {
      let poms: Pom[];
      const user: User = await this.userUtils.user().toPromise();
      poms = await this.pomService.getByCommunityId(user.currentCommunityId)
        .map( (response: RestResult) => response.result ).toPromise();
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
      budgets = await this.budgetService.getBudgets()
        .map( (response: RestResult) => response.result ).toPromise();
      budgets = budgets.sort( (a:Budget, b:Budget) => b.fy-a.fy );
      subject.next(budgets[0]);
      subject.complete();
    })();
    return subject;
  }

}
