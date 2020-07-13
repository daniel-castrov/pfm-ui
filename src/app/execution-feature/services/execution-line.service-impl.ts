import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ExecutionLineService } from './execution-line.service';
import { HttpParams } from '@angular/common/http';
import { ExecutionLine } from '../models/execution-line.model';

@Injectable()
export class ExecutionLineServiceImpl extends ExecutionLineService {
  getById(id: string): Observable<any> {
    return this.get('executionlines/' + id);
  }

  retrieveByYear(year: number): Observable<any> {
    return this.get('executionlines/year/' + year);
  }

  getByContainerId(
    containerId: string,
    programName?: string,
    appr?: string,
    blin?: string,
    item?: string,
    pe?: string,
    opAgency?: string
  ): Observable<any> {
    let params: HttpParams = new HttpParams();
    if (programName) {
      params = params.set('programName', programName);
    }
    if (appr) {
      params = params = params.set('appr', appr);
    }
    if (blin) {
      params = params.set('blin', blin);
    }
    if (item) {
      params = params.set('item', item);
    }
    if (pe) {
      params = params.set('pe', pe);
    }
    if (opAgency) {
      params = params.set('opAgency', opAgency);
    }

    return this.get('executionlines/container/' + containerId, params);
  }

  create(executionLine: ExecutionLine): Observable<any> {
    return this.post('executionlines', executionLine);
  }

  update(executionLine: ExecutionLine): Observable<any> {
    return this.put('executionlines', executionLine);
  }

  removeById(executionLineId: string): Observable<any> {
    return this.delete('executionlines/' + executionLineId);
  }
}
