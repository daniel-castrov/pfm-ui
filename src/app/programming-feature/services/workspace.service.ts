import { BaseRestService } from '../../services/base-rest.service';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export abstract class WorkspaceService extends BaseRestService {
  constructor(protected httpClient: HttpClient) {
    super(httpClient);
  }

  abstract getByPomId(pomId: string): Observable<object>;

  abstract duplicate(workspace: any): Observable<object>;

  abstract updateWorkspace(workspace: any): Observable<object>;
}
