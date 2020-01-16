import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import {OrganizationService} from './organization-service';

@Injectable({
  providedIn: 'root'
})
export class OrganizationServiceImpl extends OrganizationService {

  constructor(protected httpClient: HttpClient) {
    super(httpClient);
  }

  getAll(): Observable<Object> {
    return this.get('organization');
  }
}
