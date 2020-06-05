import { BaseRestService } from '../../services/base-rest.service';
import { Observable } from 'rxjs';
import { Injectable } from '@angular/core';

@Injectable()
export abstract class ScheduleService extends BaseRestService {
  abstract getByContainerId(containerId: string): Observable<object>;
  abstract createSchedule(schedule: any): Observable<any>;
  abstract createUfrSchedule(schedule: any): Observable<any>;
  abstract updateSchedule(schedule: any): Observable<object>;
  abstract updateUfrSchedule(schedule: any): Observable<object>;
  abstract deleteSchedule(id: any): Observable<object>;
}
