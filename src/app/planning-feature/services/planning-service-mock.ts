import { PlanningService } from './planning-service';
import { Observable, of } from 'rxjs';
import { HttpClient } from '@angular/common/http';

export class PlanningServiceMock extends PlanningService{

  constructor(){
    super(null);
  }

  getAvailableCreatePlanningYears():Observable<Object>{
    return of([2021, 2022, 2023]);
  }

  getAvailableOpenPlanningYears():Observable<Object>{
    return of([2021, 2023]);
  }
}