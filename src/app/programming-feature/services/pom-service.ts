import { Observable } from 'rxjs';
import { BaseRestService } from '../../services/base-rest.service';
import { HttpClient } from '@angular/common/http';
import { Pom } from '../models/Pom';
import { Workspace } from '../models/workspace';

export abstract class PomService extends BaseRestService {
  constructor(protected httpClient: HttpClient) {
    super(httpClient);
  }

  abstract pBYearExists(year: string): Observable<object>;

  abstract getPomFromPb(): Observable<object>;

  abstract getPomFromFile(fileId: string): Observable<object>;

  abstract getLatestPom(): Observable<object>;

  abstract getPomById(id: string): Observable<object>;

  abstract createPom(year: number, pom: Pom): Observable<object>;

  abstract getPomForYear(year: number): Observable<object>;

  abstract getPomYearsByStatus(status: string[]): Observable<object>;

  abstract openPom(pom: Pom): Observable<object>;

  abstract updatePom(pom: Pom, returnPrsToFr: boolean): Observable<object>;

  abstract getOpenPom(): Observable<object>;

  abstract canLockPom(pom: Pom, workspace: Workspace): Observable<object>;

  abstract lockPom(pom: Pom, workspaceId: Workspace): Observable<object>;

  abstract canClosePom(pom: Pom): Observable<object>;

  abstract closePom(pom: Pom): Observable<object>;
}
