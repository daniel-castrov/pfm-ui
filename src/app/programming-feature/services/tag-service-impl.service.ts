import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { TagService } from './tag.service';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class TagServiceImpl extends TagService {

  constructor(protected httpClient: HttpClient) {
    super(httpClient);
  }

  getByType(type: string): Observable<object> {
    return this.get('tags/type/' + type);
  }

}
