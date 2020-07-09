import { Injectable } from '@angular/core';
import { BaseRestService } from 'src/app/services/base-rest.service';
import { Observable } from 'rxjs';

@Injectable()
export abstract class ExecutionLineService extends BaseRestService {
  abstract getById(id: string): Observable<any>;

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
