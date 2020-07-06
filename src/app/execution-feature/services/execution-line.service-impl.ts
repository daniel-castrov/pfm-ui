import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ExecutionLineService } from './execution-line.service';

@Injectable()
export class ExecutionLineServiceImpl extends ExecutionLineService {
  getById(id: string): Observable<any> {
    return this.get('execution-line/' + id);
  }
}
