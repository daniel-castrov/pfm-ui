import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { UfrService } from './ufr-service';

@Injectable({
  providedIn: 'root'
})
export class UfrServiceImpl extends UfrService {
  constructor(protected httpClient: HttpClient) {
    super(httpClient);
  }

  getBYProgramShortName(shortName: string): Observable<object> {
    return this.get('ufr/program/short-name/' + shortName);
  }
}
