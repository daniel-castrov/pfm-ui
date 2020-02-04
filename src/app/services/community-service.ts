import {Observable} from 'rxjs';
import {BaseRestService} from './base-rest.service';
import {HttpClient} from '@angular/common/http';

export abstract class CommunityService extends BaseRestService {

  constructor(protected httpClient: HttpClient) {
    super(httpClient);
  }

  abstract getCommunity(communityId: string): Observable<object>;
}
