import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { MrdbService } from './mrdb-service';
import { Program } from '../models/Program';
import { catchError, map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class MrdbServiceImpl extends MrdbService {
  constructor(protected httpClient: HttpClient) {
    super(httpClient);
  }

  getById(mrId: string): Observable<any> {
    return this.get('mrdb/' + mrId);
  }

  getByName(shortName: string): Observable<any> {
    const shortNameParam = new HttpParams().set('shortName', shortName);
    return this.get('mrdb/name', shortNameParam);
  }

  getPrograms(organizationId: string): Observable<object> {
    if (organizationId) {
      // Filter by organization
      return this.get('mrdb/organization/' + organizationId);
    } else {
      // Get all
      return this.get('mrdb');
    }
  }

  getProgramsMinusPrs(organizationId: string, pRs: Program[]): Observable<object> {
    const prNames: Set<string> = new Set();
    for (const pr of pRs) {
      prNames.add(pr.shortName);
    }
    return this.getPrograms(organizationId).pipe(
      map((data: any) => {
        return data.result.filter(program => !prNames.has(program.shortName));
      }),
      catchError(err => {
        return of([]);
      })
    );
  }
}
