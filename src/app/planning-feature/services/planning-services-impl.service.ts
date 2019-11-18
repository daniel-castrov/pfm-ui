import { Injectable } from '@angular/core';
import { BaseRestService } from '../../services/base-rest.service';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { PlanningService } from './planning-service';

@Injectable({
  providedIn: 'root'
})
export class PlanningServicesImpl extends BaseRestService implements PlanningService{

  constructor(protected httpClient:HttpClient){
    super(httpClient);
  }

  getAvailableCreatePlanningYears():Observable<Object>{
    return this.get("getAvailableCreatePlanningYears");
  }
}