import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { OrganizationService } from './organization-service';
import { Organization } from '../pfm-common-models/Organization';

@Injectable({
  providedIn: 'root'
})
export class OrganizationServiceImpl extends OrganizationService {
  constructor(protected httpClient: HttpClient) {
    super(httpClient);
  }

  getAll(): Observable<object> {
    return this.get('organization');
  }

  getById(organizationId: string): Observable<object> {
    return this.get('organization/' + organizationId);
  }

  getMap(): Observable<object> {
    const orgs = new Map<string, Organization>();
    return this.getAll().pipe(
      map((data: any) => {
        for (const org of data.result) {
          orgs.set(org.id, org);
        }
        return orgs;
      }),
      catchError(err => {
        return of(orgs);
      })
    );
  }
}
