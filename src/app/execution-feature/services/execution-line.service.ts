import { Injectable } from '@angular/core';
import { BaseRestService } from 'src/app/services/base-rest.service';
import { Observable } from 'rxjs';
import { ExecutionLine } from '../models/execution-line.model';

@Injectable()
export abstract class ExecutionLineService extends BaseRestService {
  abstract getById(id: string): Observable<any>;
  abstract create(executionLine: ExecutionLine): Observable<any>;
  abstract update(executionLine: ExecutionLine): Observable<any>;
  abstract removeById(executionLineId: string): Observable<any>;
  abstract retrieveByYear(year: number): Observable<any>;
  abstract getByContainerId(
    containerId: string,
    programName?: string,
    appr?: string,
    blin?: string,
    item?: string,
    pe?: string,
    opAgency?: string
  ): Observable<any>;
}
