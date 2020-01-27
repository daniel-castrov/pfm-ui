import { Observable } from 'rxjs';
import { BaseRestService } from '../../services/base-rest.service';
import { HttpClient } from '@angular/common/http';
import { Program } from '../models/Program';

export abstract class MrdbService extends BaseRestService {

  constructor( protected httpClient: HttpClient ) {
    super( httpClient );
  }

  /**
   * Get Programs from master program list
   *
   * @param organizationId - Organization Id for filtering by organization, null for all
   */
  abstract getPrograms( organizationId: string ): Observable<object>;

  /**
   * Get Programs from master program list and remove any Programs that match the passed in Program Requests
   *
   * @param organizationId - Organization Id for filtering by organization, null for all
   * @param pRs - Existing Program Requests to filter against
   */
  abstract getProgramsMinusPrs( organizationId: string, pRs: Program[] ): Observable<object>;
}
