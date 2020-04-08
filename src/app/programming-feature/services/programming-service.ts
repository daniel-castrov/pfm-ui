import { Observable } from 'rxjs';
import { BaseRestService } from '../../services/base-rest.service';
import { HttpClient } from '@angular/common/http';
import { Program } from '../models/Program';

export abstract class ProgrammingService extends BaseRestService {
  constructor(protected httpClient: HttpClient) {
    super(httpClient);
  }

  /**
   * Get PRs for a container
   *
   * @param containerId - Container Id
   * @param organizationId - Organization Id for filtering by organization, null for all
   */
  abstract getPRsForContainer(containerId: string, organizationId: string): Observable<object>;
  abstract getBaBlinSummary(containerId: string, organizationId?: string): Observable<object>;
  abstract processPRsForContainer(containerId: string, action: string, organizationId?: string): Observable<object>;
  abstract getPermittedOrganizations(): Observable<object>;
  abstract getPRForYearAndShortName(year: number, shortName: string): Observable<any>;
  abstract getProgramById(id: string): Observable<any>;
  abstract updateProgram(program: Program): Observable<any>;
}
