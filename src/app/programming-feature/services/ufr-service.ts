import { Observable } from 'rxjs';
import { BaseRestService } from '../../services/base-rest.service';
import { HttpClient } from '@angular/common/http';
import { UFR } from '../models/ufr.model';

export abstract class UfrService extends BaseRestService {
  constructor(protected httpClient: HttpClient) {
    super(httpClient);
  }

  abstract getByProgramShortName(shortName: string): Observable<object>;
  abstract getById(id: string): Observable<object>;
  abstract getByContainerId(containerId: string): Observable<any>;
  abstract create(ufr: UFR): Observable<any>;
}
