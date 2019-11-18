import { PlanningService } from './planning-service';
import { Observable, of } from 'rxjs';

export class PlanningServiceMock implements PlanningService{

  getAvailableCreatePlanningYears():Observable<Object>{
    return of([2021, 2022, 2023]);
  }
}