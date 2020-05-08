import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { CommunityService } from './community-service';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class CommunityServiceImpl extends CommunityService {
  constructor(protected httpClient: HttpClient) {
    super(httpClient);
  }

  getCommunity(communityId: string): Observable<object> {
    return this.get('community/' + communityId);
  }
}
