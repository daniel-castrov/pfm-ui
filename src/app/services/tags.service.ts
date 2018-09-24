import { Observable } from 'rxjs/Observable';
import { RestResult } from '../generated/model/restResult';
import { Injectable } from '@angular/core';
import 'rxjs/add/operator/map'
import { ProgramsService } from '../generated/api/programs.service';
import { Tag } from '../generated/model/tag';
import {CacheService} from "./caching";

/**
 * This service is not caching now but it should/will in the future. At some point we should figure out
 * how to make it cache. The callers can assume all calls to this service are very fast and call it as often
 * as they want without attempting to cache by themselves.
 */
@Injectable()
export class TagsService {

  constructor(private programsService: ProgramsService) {}

  tags(tagType: string): Observable<Tag[]> {
    const resultGetter: () => Observable<Tag[]> = () => this.programsService.getTagsByType(tagType)
            .map((result: RestResult) => result.result)
            .map( (tags: Tag[]) => tags.sort((a: Tag, b: Tag) => {
              if (a.abbr === b.abbr) {
                return 0;
              }
              return (a.abbr < b.abbr ? -1 : 1);
            }));
    return CacheService.caching(tagType, resultGetter);
  }

  private tagAbbreviations(tagType: string): Promise<string[]> {
    return this.tags(tagType)
            .map((tags: Tag[]) => tags.map((tag:Tag)=>tag.abbr))
            .map((tags: string[]) => tags.sort())
            .toPromise();
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

  tagAbbreviationsForFunctionalArea(): Promise<string[]> {
    return this.tagAbbreviations('Functional Area');
  }

}
