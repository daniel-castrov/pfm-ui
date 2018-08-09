import { CommunityService } from '../generated/api/community.service';
import { Community } from '../generated/model/community';
import { User } from '../generated/model/user';
import { Observable } from 'rxjs/Observable';
import { RestResult } from '../generated/model/restResult';
import { MyDetailsService } from '../generated/api/myDetails.service';
import { Injectable } from '@angular/core';
import 'rxjs/add/operator/map'

/**
 * This service is not caching now but it should/will in the future. At some point we should figure out
 * how to make it cache. The callers can assume all calls to this service are very fast and call it as often 
 * as they want without attempting to cache by themselves.
 * 
 * At or after the time we make it cache we might also consider how to invalidate the cache, e.g. when the 
 * user changes the current community.
 */
@Injectable()
export class UserService {

  constructor(private myDetailsService: MyDetailsService,
              private communityService: CommunityService) {}

  user(): Observable<User> {
    return this.myDetailsService.getCurrentUser().map( (response: RestResult) => response.result );
  }

  async currentCommunity(): Promise<Community> {
    const user: User = await this.user().toPromise();
    const community: Community = (await this.communityService.getById(user.currentCommunityId).toPromise()).result;
    return community;
  }

}
