import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ExecutionEventService } from './execution-event.service';
import { HttpParams } from '@angular/common/http';

@Injectable()
export class ExecutionEventServiceImpl extends ExecutionEventService {
  getByExecutionLineId(executionLineId: string): Observable<any> {
    return this.get('executionevent/exeline/' + executionLineId);
  }

  getByContainer(containerId: string, ...types: string[]): Observable<any> {
    const params = new HttpParams().append('type', types.join(','));
    return this.get('executionevent/container/' + containerId, params);
  }
}
