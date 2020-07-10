import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ExecutionEventService } from './execution-event.service';

@Injectable()
export class ExecutionEventServiceImpl extends ExecutionEventService {
  getByExecutionLineId(executionLineId: string): Observable<any> {
    return this.get('executionevent/exeline/' + executionLineId);
  }
}
