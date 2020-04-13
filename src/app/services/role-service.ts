import { Observable } from 'rxjs';
import { BaseRestService } from './base-rest.service';
import { HttpClient } from '@angular/common/http';

export abstract class RoleService extends BaseRestService {
  constructor(protected httpClient: HttpClient) {
    super(httpClient);
  }

  abstract getAll(): Observable<object>;

  abstract getMap(): Observable<object>;
}
