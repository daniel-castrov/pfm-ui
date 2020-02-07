import { Observable } from 'rxjs';
import { BaseRestService } from './base-rest.service';
import { HttpClient } from '@angular/common/http';

export abstract class VisibilityService extends BaseRestService {
  constructor( protected httpClient: HttpClient ) {
    super( httpClient );
  }

  abstract isVisible( componentId: string ): Observable<object>;
}
