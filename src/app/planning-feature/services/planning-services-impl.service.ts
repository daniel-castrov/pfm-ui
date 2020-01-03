import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { PlanningService } from './planning-service';

@Injectable({
  providedIn: 'root'
})
export class PlanningServicesImpl extends PlanningService{

  constructor(protected httpClient:HttpClient){
    super(httpClient);
  }

  getAllPlanning():Observable<Object>{
    return this.get("planning");
  }

  createPlanningPhase(data:any):Observable<Object>{
    return this.post("planning", data);
  }

  openPlanningPhase(data:any):Observable<Object>{
    return this.put("planning/open", data);
  }

  lockPlanningPhase(data:any):Observable<Object>{
    return this.put("planning/lock", data);
  }

  closePlanningPhase(data:any):Observable<Object>{
    return this.put("planning/close", data);
  }

  createMissionPriority(data:any):Observable<Object>{
    return this.post("missionPriority", data);
  }

  updateMissionPriority(data:any):Observable<Object>{
    return this.put("missionPriority/missionPriorities", data);
  }

  deleteMissionPriority(id:any):Observable<Object>{
    return this.delete("missionPriority/" + id);
  }

  getMissionPriorities(phaseId:string):Observable<Object>{
    return this.get("missionPriority/planningPhase/" + phaseId);
  }

  cloneMissionPriorities(data: any, phaseId:string):Observable<Object>{
    return this.post("/clone/planningPhase/" + phaseId, data);
  }
}
