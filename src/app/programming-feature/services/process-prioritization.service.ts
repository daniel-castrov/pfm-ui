import { BaseRestService } from '../../services/base-rest.service';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export abstract class ProcessPrioritizationService extends BaseRestService {
  constructor(protected httpClient: HttpClient) {
    super(httpClient);
  }

  abstract getByContainerId(containerId: string): Observable<object>;
  abstract createProcessPrioritization(processPrioritization: any): Observable<object>;
  abstract updateProcessPrioritization(processPrioritization: any): Observable<object>;
  abstract deleteProcessPrioritization(id: any): Observable<object>;
}
