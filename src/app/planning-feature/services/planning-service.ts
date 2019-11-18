import { Observable } from 'rxjs';

export interface PlanningService {

  getAvailableCreatePlanningYears():Observable<Object>;
}