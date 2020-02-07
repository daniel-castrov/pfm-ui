import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ProgrammingService } from './programming-service';

@Injectable( {
  providedIn: 'root'
} )
export class ProgrammingServiceImpl extends ProgrammingService {

  constructor( protected httpClient: HttpClient ) {
    super( httpClient );
  }

  getPRsForContainer( containerId: string, organizationId?: string ): Observable<object> {
    organizationId =  organizationId ? organizationId : '';
    return this.get( 'program/container/' + containerId,  new HttpParams().set('organizationId', organizationId));
  }

  approvePRsForContainer(containerId: string): Observable<object> {
    return this.put('program/container/' + containerId + '/approve', null);
  }
}
