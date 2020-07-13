import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { ExecutionService } from './execution.service';
import { tap, switchMap } from 'rxjs/operators';

@Injectable()
export class ExecutionServiceImpl extends ExecutionService {
  getYearsReadyForExecution(): Observable<any> {
    return this.get('execution/years-for-execution');
  }

  getExecutionYears(): Observable<any> {
    return this.get('execution');
  }

  create(year: number, file: Blob, filename: string): Observable<any> {
    const formData = new FormData();

    return of(formData).pipe(
      tap(() => {
        formData.append('file', new File([file], filename));
        this.headers = this.headers.delete('Content-Type');
      }),
      switchMap(() =>
        this.post('execution/year/' + year, formData).pipe(
          tap(() => {
            this.headers = this.headers.set('Content-Type', 'application/json; charset=utf-8');
          })
        )
      )
    );
  }

  getById(id: string): Observable<any> {
    return this.get('execution/' + id);
  }
}
