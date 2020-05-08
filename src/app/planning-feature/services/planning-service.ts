import { Observable } from 'rxjs';
import { BaseRestService } from '../../services/base-rest.service';
import { HttpClient } from '@angular/common/http';

export abstract class PlanningService extends BaseRestService {
  constructor(protected httpClient: HttpClient) {
    super(httpClient);
  }

  abstract getAllPlanning(): Observable<object>;
  abstract createPlanningPhase(data: any): Observable<object>;
  abstract openPlanningPhase(data: any): Observable<object>;
  abstract lockPlanningPhase(data: any): Observable<object>;
  abstract closePlanningPhase(data: any): Observable<object>;
  abstract createMissionPriority(data: any): Observable<object>;
  abstract updateMissionPriority(data: any): Observable<object>;
  abstract deleteMissionPriority(data: any): Observable<object>;
  abstract getMissionPriorities(phaseId: string): Observable<any>;
  abstract getMissionPrioritiesForPOM(phaseId: string): Observable<any>;
  abstract cloneMissionPriorities(phaseId: string): Observable<object>;
  abstract getPlanningByYear(year: number): Observable<any>;
}
