import { Observable } from 'rxjs';
import { BaseRestService } from '../../services/base-rest.service';
import { HttpClient } from '@angular/common/http';

export abstract class ProgrammingService extends BaseRestService {

  constructor( protected httpClient: HttpClient ) {
    super( httpClient );
  }

  abstract getPRsForContainer( containerId: string ): Observable<object>;
  abstract getPRsForContainerAndOrganization( containerId: string, organizationId: string ): Observable<object>;
}
