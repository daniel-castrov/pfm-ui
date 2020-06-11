import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { UfrService } from './ufr-service';
import { UFR } from '../models/ufr.model';

@Injectable({
  providedIn: 'root'
})
export class UfrServiceImpl extends UfrService {
  constructor(protected httpClient: HttpClient) {
    super(httpClient);
  }

  getByProgramShortName(shortName: string): Observable<object> {
    const params: HttpParams = new HttpParams().set('shortName', shortName);
    return this.get('ufr/program/short-name', params);
  }

  getById(id: string): Observable<object> {
    return this.get('ufr/' + id);
  }

  create(ufr: UFR): Observable<any> {
    return this.post('ufr', ufr);
  }

  update(ufr: UFR) {
    return this.put('ufr', ufr);
  }

  getByContainerId(containerId: string): Observable<any> {
    return this.get('ufr/container/' + containerId);
  }

  remove(id: string) {
    return this.delete('ufr/' + id);
  }
}
