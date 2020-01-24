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

  getPRsForContainer( containerId: string ): Observable<object> {
    return this.get( 'program/container/' + containerId );
  }

  getPRsForContainerAndOrganization( containerId: string, organizationId: string ): Observable<object> {
    return this.get( 'program/container/' + containerId + '/organization/' + organizationId );
  }
}
