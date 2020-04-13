import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { PropertyService } from './property.service';

@Injectable({
  providedIn: 'root'
})
export class PropertyServiceImpl extends PropertyService {
  constructor(protected httpClient: HttpClient) {
    super(httpClient);
  }

  getByType(type: string): Observable<object> {
    return this.get('property/type/' + type);
  }
}
