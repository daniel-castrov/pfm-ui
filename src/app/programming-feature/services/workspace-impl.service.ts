import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { WorkspaceService } from './workspace.service';

@Injectable({
  providedIn: 'root'
})
export class WorkspaceServiceImpl extends WorkspaceService {
  constructor(protected httpClient: HttpClient) {
    super(httpClient);
  }

  getByPomId(pomId: string): Observable<object> {
    return this.get('workspaces/pom/' + pomId);
  }
}
