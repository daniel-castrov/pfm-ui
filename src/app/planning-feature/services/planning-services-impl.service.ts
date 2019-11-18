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

  getAvailableCreatePlanningYears():Observable<Object>{
    return this.get("getAvailableCreatePlanningYears");
  }

  getAvailableOpenPlanningYears():Observable<Object>{
    return this.get("getAvailableOpenPlanningYears");
  }

  getMissionPrioritiesYears():Observable<Object>{
    return this.get("getMissionPrioritiesYears");
  }
}