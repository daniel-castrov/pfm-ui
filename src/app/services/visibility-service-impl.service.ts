import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { VisibilityService } from './visibility-service';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class VisibilityServiceImpl extends VisibilityService {
  constructor(protected httpClient: HttpClient) {
    super(httpClient);
  }

  isVisible(componentId: string): Observable<object> {
    return this.get('visible/' + componentId);
  }

  isCurrentlyVisible(componentId: string): Observable<object> {
    return this.get('visible/' + componentId + '/current');
  }
}
