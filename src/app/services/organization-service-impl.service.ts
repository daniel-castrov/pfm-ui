import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {Observable, of} from 'rxjs';
import {catchError, map} from 'rxjs/operators';
import {OrganizationService} from './organization-service';
import {Organization} from '../pfm-common-models/Organization';

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

  getMap(): Observable<object> {
    const url = 'organization';
    const orgs = new Map<string, Organization>();
    return this.get(url).pipe(
      map((data: any) => {
        for (const org of data.result) {
          orgs.set(org.id, org);
        }
        return orgs;
      }),
      catchError(err => {
        console.log('error while GET : ' + url);
        console.warn(err);
        return of(orgs);
      })
    );
  }
}
