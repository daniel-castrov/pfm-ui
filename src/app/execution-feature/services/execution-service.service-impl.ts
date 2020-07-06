import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ExecutionService } from './execution.service';

@Injectable()
export class ExecutionServiceServiceImpl extends ExecutionService {
  getYearsReadyForExecution(): Observable<any> {
    return this.get('execution/years-for-execution');
  }

  getExecutionYears(): Observable<any> {
    return this.get('execution');
  }
}
