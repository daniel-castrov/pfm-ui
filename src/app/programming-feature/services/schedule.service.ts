import { BaseRestService } from '../../services/base-rest.service';
import { Observable } from 'rxjs';
import { Injectable } from '@angular/core';

@Injectable()
export abstract class ScheduleService extends BaseRestService {
  abstract getByProgramId(programId: string): Observable<object>;
  abstract createSchedule(schedule: any): Observable<any>;
  abstract updateSchedule(schedule: any): Observable<object>;
  abstract deleteSchedule(id: any): Observable<object>;
}
