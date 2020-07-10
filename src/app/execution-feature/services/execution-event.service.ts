import { Injectable } from '@angular/core';
import { BaseRestService } from 'src/app/services/base-rest.service';
import { Observable } from 'rxjs';

@Injectable()
export abstract class ExecutionEventService extends BaseRestService {
  abstract getByExecutionLineId(executionLineId: string): Observable<any>;
}
