import { BaseRestService } from '../../services/base-rest.service';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export abstract class WorkspaceService extends BaseRestService {
  constructor(protected httpClient: HttpClient) {
    super(httpClient);
  }

  abstract getByContainerId(containerId: string): Observable<object>;

  abstract getByContainerIdAndVersion(containerId: string, version: number): Observable<object>;

  abstract getByContainerIdAndActive(containerId: string, active: boolean): Observable<object>;

  abstract duplicate(workspace: any): Observable<object>;

  abstract updateWorkspace(workspace: any): Observable<object>;

  abstract getByProgramShortName(shortName: string): Observable<object>;
}
