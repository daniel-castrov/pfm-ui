import { Observable } from 'rxjs';
import { BaseRestService } from '../../services/base-rest.service';
import { HttpClient } from '@angular/common/http';

export abstract class PlanningService extends BaseRestService{

  constructor(protected httpClient:HttpClient){
    super(httpClient);
  }

  abstract getAvailableCreatePlanningYears():Observable<Object>;
  abstract getAvailableOpenPlanningYears():Observable<Object>;
  abstract getMissionPrioritiesYears():Observable<Object>;
}