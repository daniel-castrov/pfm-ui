import { Observable } from 'rxjs';

export abstract class PlanningService {

  abstract getAvailableCreatePlanningYears():Observable<Object>;
}