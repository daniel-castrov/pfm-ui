import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { ExecutionLineService } from './execution-line.service';

@Injectable()
export class ExecutionLineServiceImpl extends ExecutionLineService {
  retrieveByYear(year: number): Observable<any> {
    return this.get('executionlines/year/' + year);
  }
}
