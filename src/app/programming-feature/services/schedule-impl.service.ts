import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Schedule } from '../models/schedule.model';
import { ScheduleService } from './schedule.service';
import { DATE_FORMAT } from '../../util/constants/input.constants';
import * as moment from 'moment';
import { map } from 'rxjs/operators';
import { RestResponse } from 'src/app/util/rest-response';

@Injectable({
  providedIn: 'root'
})
export class ScheduleServiceImpl extends ScheduleService {
  getByProgramId(programId: string): Observable<object> {
    return this.get('schedules/program/' + programId).pipe(
      map((res: RestResponse<any>) => this.convertDateArrayFromServer(res))
    );
  }

  createSchedule(schedule: Schedule): Observable<any> {
    const copy = this.convertDateFromClient(schedule);
    return this.post('schedules', copy).pipe(map((res: RestResponse<any>) => this.convertDateFromServer(res)));
  }

  updateSchedule(schedule: Schedule): Observable<any> {
    const copy = this.convertDateFromClient(schedule);
    return this.put('schedules', copy);
  }

  deleteSchedule(scheduleId: any): Observable<object> {
    return this.delete('schedules/' + scheduleId);
  }

  protected convertDateFromClient(schedule: Schedule): Schedule {
    const copy: Schedule = Object.assign({}, schedule, {
      startDate:
        schedule.startDate != null && schedule.startDate.isValid() ? schedule.startDate.format(DATE_FORMAT) : null,
      endDate: schedule.endDate != null && schedule.endDate.isValid() ? schedule.endDate.format(DATE_FORMAT) : null
    });
    return copy;
  }

  protected convertDateFromServer(res: RestResponse<any>): RestResponse<any> {
    if (res.result) {
      res.result.startDate = res.result.startDate != null ? moment(res.result.startDate) : null;
      res.result.endDate = res.result.endDate != null ? moment(res.result.endDate) : null;
    }
    return res;
  }

  protected convertDateArrayFromServer(res: RestResponse<any>): RestResponse<any> {
    if (res.result) {
      res.result.forEach((schedule: Schedule) => {
        schedule.startDate = schedule.startDate != null ? moment(schedule.startDate) : null;
        schedule.endDate = schedule.endDate != null ? moment(schedule.endDate) : null;
      });
    }
    return res;
  }
}
