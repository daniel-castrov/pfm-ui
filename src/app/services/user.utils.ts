import { CommunityService } from '../generated/api/community.service';
import { Community } from '../generated/model/community';
import { User } from '../generated/model/user';
import { Observable } from 'rxjs/Observable';
import { RestResult } from '../generated/model/restResult';
import { MyDetailsService } from '../generated/api/myDetails.service';
import { Injectable } from '@angular/core';
import 'rxjs/add/operator/map'
import {Caching, TemporaryCaching} from "./caching";

@Injectable()
export class UserUtils {

  constructor(private myDetailsService: MyDetailsService,
              private communityService: CommunityService) {}

  @Caching('user')
  user(): Observable<User> {
    return this.myDetailsService.getCurrentUser().map( (response: RestResult) => response.result );
  }

  @TemporaryCaching('currentCommunity')
  currentCommunity(): Observable<Community> {
    return this.user()
      .switchMap( (user: User) => this.communityService.getById(user.currentCommunityId) )
      .map( (response: RestResult) => response.result );
  }

}
