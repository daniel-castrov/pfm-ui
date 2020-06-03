import { Observable } from 'rxjs';
import { BaseRestService } from '../../services/base-rest.service';
import { HttpClient } from '@angular/common/http';

export abstract class UfrService extends BaseRestService {
  constructor(protected httpClient: HttpClient) {
    super(httpClient);
  }

  abstract getByProgramShortName(shortName: string): Observable<object>;

  abstract getById(id: string): Observable<object>;
}
