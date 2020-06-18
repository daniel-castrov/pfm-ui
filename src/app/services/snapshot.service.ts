import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { BaseRestService } from './base-rest.service';

@Injectable({
  providedIn: 'root'
})
export class SnapshotService extends BaseRestService {
  getAll(): Observable<object> {
    return this.get('snapshot');
  }

  create(description: string): Observable<object> {
    return this.post('snapshot/' + description);
  }

  apply(collectionName: any) {
    return this.put('snapshot/' + collectionName);
  }
}
