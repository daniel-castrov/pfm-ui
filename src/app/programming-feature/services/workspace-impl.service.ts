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

  getByContainerId(containerId: string): Observable<object> {
    return this.get('workspaces/container/' + containerId);
  }

  getByContainerIdAndActive(containerId: string, active: boolean): Observable<object> {
    return this.get('workspaces/container/' + containerId + '?active=' + active);
  }

  duplicate(workspace: any): Observable<object> {
    return this.put('workspaces/duplicate', workspace);
  }

  updateWorkspace(workspace: any): Observable<object> {
    return this.put('workspaces', workspace);
  }
}
