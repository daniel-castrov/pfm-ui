import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { PlanningService } from './planning-service';

@Injectable({
  providedIn: 'root'
})
export class PlanningServicesImpl extends PlanningService {

  constructor(protected httpClient: HttpClient) {
    super(httpClient);
  }

  getAllPlanning(): Observable<object> {
    return this.get('planning');
  }

  createPlanningPhase(data: any): Observable<object> {
    return this.post('planning', data);
  }

  openPlanningPhase(data: any): Observable<object> {
    return this.put('planning/open', data);
  }

  lockPlanningPhase(data: any): Observable<object> {
    return this.put('planning/lock', data);
  }

  closePlanningPhase(data: any): Observable<object> {
    return this.put('planning/close', data);
  }

  createMissionPriority(data: any): Observable<object> {
    return this.post('missionPriority', data);
  }

  updateMissionPriority(data: any): Observable<object> {
    return this.put('missionPriority/missionPriorities', data);
  }

  deleteMissionPriority(id: any): Observable<object> {
    return this.delete('missionPriority/' + id);
  }

  getMissionPriorities(phaseId: string): Observable<object> {
    return this.get('missionPriority/planningPhase/' + phaseId);
  }

  cloneMissionPriorities(phaseId: string): Observable<object> {
    return this.post('missionPriority/clone/planningPhase/' + phaseId, null);
  }

  getPlanningByYear(year: number): Observable<any> {
    return this.get('planning/year/' + year);
  }
}
