import { Injectable } from '@angular/core';
import { BaseRestService } from 'src/app/services/base-rest.service';
import { Observable } from 'rxjs';

@Injectable()
export abstract class ExecutionService extends BaseRestService {
  abstract getYearsReadyForExecution(): Observable<any>;

  abstract getExecutionYears(): Observable<any>;

  abstract create(year: number, file: Blob, filename: string): Observable<any>;

  abstract getById(id: string): Observable<any>;
}
