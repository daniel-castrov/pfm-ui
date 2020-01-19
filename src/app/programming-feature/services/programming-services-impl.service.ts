import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { ProgrammingService } from './programming-service';


@Injectable({
  providedIn: 'root'
})
export class ProgrammingServiceImpl extends ProgrammingService {

  constructor(protected httpClient: HttpClient) {
    super(httpClient);
  }

  getRequestsForPom(pom): Observable<Object> {
    return this.get('program/container/' + pom.workspaceId);
  }
}
