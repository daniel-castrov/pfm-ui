import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import {PomService} from './pom-service';


@Injectable({
  providedIn: 'root'
})
export class PomServiceImpl extends PomService {

  constructor(protected httpClient: HttpClient) {
    super(httpClient);
  }

  pBYearExists(year: string): Observable<Object> {
    return this.get('pom/init/fromPB/year/' + year + '/exists');
  }

  getPomFromPb(): Observable<Object> {
    return this.get('pom/init/fromPB');
  }

  getAllorganizations(): Observable<Object> {
    return this.get('organization');
  }

  getPomFromFile(fileId: string): Observable<Object> {
    return this.get('pom/init/fromLibrary/id/' + fileId);
  }

}
