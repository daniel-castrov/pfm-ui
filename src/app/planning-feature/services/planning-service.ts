import { Observable } from 'rxjs';
import { BaseRestService } from '../../services/base-rest.service';
import { HttpClient } from '@angular/common/http';

export abstract class PlanningService extends BaseRestService{

  constructor(protected httpClient:HttpClient){
    super(httpClient);
  }

  abstract getAllPlanning():Observable<Object>;
  abstract createPlanningPhase(data:any):Observable<Object>;
  abstract openPlanningPhase(data:any):Observable<Object>;
  abstract lockPlanningPhase(data:any):Observable<Object>;
  abstract closePlanningPhase(data:any):Observable<Object>;
  abstract createMissionPriority(data:any):Observable<Object>;
  abstract updateMissionPriority(data:any):Observable<Object>;
  abstract deleteMissionPriority(data:any):Observable<Object>;
  abstract getMissionPriorities(phaseId:string):Observable<Object>;
}
