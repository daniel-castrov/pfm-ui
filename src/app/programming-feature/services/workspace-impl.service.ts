import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
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

  getByContainerIdAndVersion(containerId: string, version: number): Observable<object> {
    return this.get('workspaces/container/' + containerId + '/version/' + version);
  }

  duplicate(workspace: any): Observable<object> {
    return this.put('workspaces/duplicate', workspace);
  }

  updateWorkspace(workspace: any): Observable<object> {
    return this.put('workspaces', workspace);
  }

  getByProgramShortName(shortName: string) {
    const params: HttpParams = new HttpParams().set('shortName', shortName);
    return this.get('workspaces/program-short-name/', params);
  }
}
