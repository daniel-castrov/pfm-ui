import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ProgrammingService } from './programming-service';

@Injectable( {
  providedIn: 'root'
} )
export class ProgrammingServiceImpl extends ProgrammingService {

  constructor( protected httpClient: HttpClient ) {
    super( httpClient );
  }

  getPRsForContainer( containerId: string, organizationId: string ): Observable<object> {
    if ( organizationId ) {
      // Filter by organization
      return this.get( 'program/container/' + containerId + '/organization/' + organizationId );
    } else {
      // Get all
      return this.get( 'program/container/' + containerId );
    }
  }

  approvePRsForContainer(containerId: string): Observable<object> {
    return this.put('program/container/' + containerId + '/approve', null);
  }
}
