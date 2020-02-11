import { Observable } from 'rxjs';
import { BaseRestService } from '../../services/base-rest.service';
import { HttpClient } from '@angular/common/http';

export abstract class ProgrammingService extends BaseRestService {

  constructor( protected httpClient: HttpClient ) {
    super( httpClient );
  }


  /**
   * Get PRs for a container
   *
   * @param containerId - Container Id
   * @param organizationId - Organization Id for filtering by organization, null for all
   */
  abstract getPRsForContainer( containerId: string, organizationId: string ): Observable<object>;

  abstract processPRsForContainer( containerId: string, action: string, organizationId?: string);

  abstract getPermittedOrganizations();
}
