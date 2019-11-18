import { Observable } from 'rxjs';
import { BaseRestService } from '../../services/base-rest.service';

export abstract class PlanningService extends BaseRestService{

  abstract getAvailableCreatePlanningYears():Observable<Object>;
  abstract getAvailableOpenPlanningYears():Observable<Object>;
}