import { Observable } from 'rxjs';
import { BaseRestService } from '../../services/base-rest.service';
import { HttpClient } from '@angular/common/http';
import { Pom } from '../models/Pom';

export abstract class PomService extends BaseRestService {
  constructor(protected httpClient: HttpClient) {
    super(httpClient);
  }

  abstract pBYearExists(year: string): Observable<object>;

  abstract getPomFromPb(): Observable<object>;

  abstract getPomFromFile(fileId: string): Observable<object>;

  abstract getLatestPom(): Observable<object>;

  abstract createPom(year: number, pom: Pom): Observable<object>;

  abstract getPomForYear(year: number): Observable<object>;

  abstract getPomYearsByStatus(status: string[]): Observable<object>;

  abstract openPom(pom: Pom): Observable<object>;
}
