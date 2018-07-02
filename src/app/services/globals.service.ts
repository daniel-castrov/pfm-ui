import { CommunityService } from './../generated/api/community.service';
import { Community } from './../generated/model/community';
import { User } from './../generated/model/user';
import { Observable } from 'rxjs/Observable';
import { RestResult } from './../generated/model/restResult';
import { MyDetailsService } from './../generated/api/myDetails.service';
import { Injectable } from '@angular/core';
import 'rxjs/add/operator/map'
import { ProgramsService } from '../generated/api/programs.service';
import { Tag } from '../generated/model/tag';

/**
 * This service is not caching now but it should/will in the future. At some poiont we should figure out
 * how to make it cache. The callers can assume all calls to this service are very fast and call it as often 
 * as they want without attempting to cache by themselves.
 * 
 * At or after the time we make it cache we might also consider how to invalidate the cache, e.g. when the 
 * user changes the current community.
 */
@Injectable()
export class GlobalsService {

  constructor(private myDetailsService: MyDetailsService,
              private programsService: ProgramsService,
              private communityService: CommunityService) {}

  user(): Observable<User> {
    return this.myDetailsService.getCurrentUser().map( (response: RestResult) => response.result );
  }

  async currentCommunity(): Promise<Community> {
    const user: User = await this.user().toPromise();
    const community: Community = (await this.communityService.getById(user.currentCommunityId).toPromise()).result;
    return community;
  }

  private tagAbbreviations(type: string): Promise<string[]> {
    return this.programsService.getTagsByType(type)
            .map((result: RestResult) => result.result)
            .map((tags: Tag[]) => tags.map((tag:Tag)=>tag.abbr))
            .map((tags: string[]) => tags.sort())
            .toPromise()
  }

  tagAbbreviationsForOpAgency(): Promise<string[]> {
    return this.tagAbbreviations('OpAgency (OA)');
  }

  tagAbbreviationsForAppropriation(): Promise<string[]> {
    return this.tagAbbreviations('Appropriation');
  }

  tagAbbreviationsForBlin(): Promise<string[]> {
    return this.tagAbbreviations('BLIN');
  }

  tagAbbreviationsForBa(): Promise<string[]> {
    return this.tagAbbreviations('BA');
  }

  tagAbbreviationsForAcquisitionType(): Promise<string[]> {
    return this.tagAbbreviations('Acquisition Type');
  }

  

}
