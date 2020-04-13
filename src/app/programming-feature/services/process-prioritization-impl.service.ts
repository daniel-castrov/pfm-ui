import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ProcessPrioritizationService } from './process-prioritization.service';
import { DATE_FORMAT } from '../../util/constants/input.constants';
import { ProcessPrioritization } from '../models/process-prioritization.model';
import * as moment from 'moment';
import { map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class ProcessPrioritizationServiceImpl extends ProcessPrioritizationService {
  constructor(protected httpClient: HttpClient) {
    super(httpClient);
  }

  getByProgram(programId: string): Observable<object> {
    return this.get('processPrioritization/programId/' + programId).pipe(
      map((res: RestResponse<any>) => this.convertDateArrayFromServer(res))
    );
  }

  createProcessPrioritization(data: any): Observable<object> {
    const copy = this.convertDateFromClient(data);
    return this.post('processPrioritization', data).pipe(
      map((res: RestResponse<any>) => this.convertDateFromServer(res))
    );
  }

  updateProcessPrioritization(data: any): Observable<object> {
    const copy = this.convertDateFromClient(data);
    return this.put('processPrioritization', data);
  }

  deleteProcessPrioritization(id: any): Observable<object> {
    return this.delete('processPrioritization/' + id);
  }

  protected convertDateFromClient(processPrioritization: ProcessPrioritization): ProcessPrioritization {
    const copy: ProcessPrioritization = Object.assign({}, processPrioritization, {
      estimatedCompletionDate:
        processPrioritization.estimatedCompletionDate != null && processPrioritization.estimatedCompletionDate.isValid()
          ? processPrioritization.estimatedCompletionDate.format(DATE_FORMAT)
          : null
    });
    return copy;
  }

  protected convertDateFromServer(res: RestResponse<any>): RestResponse<any> {
    if (res.result) {
      res.result.estimatedCompletionDate =
        res.result.estimatedCompletionDate != null ? moment(res.result.estimatedCompletionDate) : null;
    }
    return res;
  }

  protected convertDateArrayFromServer(res: RestResponse<any>): RestResponse<any> {
    if (res.result) {
      res.result.forEach((processPrioritization: ProcessPrioritization) => {
        processPrioritization.estimatedCompletionDate =
          processPrioritization.estimatedCompletionDate != null
            ? moment(processPrioritization.estimatedCompletionDate)
            : null;
      });
    }
    return res;
  }
}
