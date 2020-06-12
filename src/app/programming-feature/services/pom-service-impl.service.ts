import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { PomService } from './pom-service';
import { Pom } from '../models/Pom';
import { Workspace } from '../models/workspace';

@Injectable({
  providedIn: 'root'
})
export class PomServiceImpl extends PomService {
  constructor(protected httpClient: HttpClient) {
    super(httpClient);
  }

  pBYearExists(year: string): Observable<object> {
    return this.get('pom/init/fromPB/year/' + year + '/exists');
  }

  getPomFromPb(): Observable<object> {
    return this.get('pom/init/fromPB');
  }

  getPomFromFile(fileId: string): Observable<object> {
    return this.get('pom/init/fromLibrary/id/' + fileId);
  }

  getLatestPom(): Observable<object> {
    return this.get('pom/latest');
  }

  getPomById(id: string): Observable<object> {
    return this.get('pom/' + id);
  }

  createPom(year: number, pom: Pom): Observable<object> {
    return this.post('pom/year/' + year, pom);
  }

  getPomForYear(year: number): Observable<object> {
    return this.get('pom/year/' + year);
  }

  getPomYearsByStatus(status: string[]): Observable<object> {
    return this.get('pom/years/by-status/' + status);
  }

  openPom(pom: Pom): Observable<object> {
    return this.put('pom/open', pom);
  }

  updatePom(pom: Pom, returnPrsToFr: boolean = false): Observable<object> {
    return this.put('pom', pom, new HttpParams().set('returnPrsToFr', `${returnPrsToFr}`));
  }

  getOpenPom(): Observable<object> {
    return this.get('pom/open');
  }

  canLockPom(pom: Pom, workspace: Workspace): Observable<object> {
    return this.get(`pom/${pom.id}/${workspace.id}/canlock`);
  }

  lockPom(pom: Pom, workspace: Workspace): Observable<object> {
    return this.put(`pom/${pom.id}/${workspace.id}/lock`);
  }
}
