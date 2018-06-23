import { User } from './../generated/model/user';
import { Observable } from 'rxjs/Observable';
import { RestResult } from './../generated/model/restResult';
import { MyDetailsService } from './../generated/api/myDetails.service';
import { Injectable } from '@angular/core';
import 'rxjs/add/operator/map'
import { ProgramsService } from '../generated/api/programs.service';
import { Tag } from '../generated/model/tag';

@Injectable()
export class GlobalsService {

  constructor(private myDetailsService: MyDetailsService,
              private programsService: ProgramsService) {}

  // TODO: make it cache
  user(): Observable<User> {
    return this.myDetailsService.getCurrentUser().map( (response: RestResult) => response.result );
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

  

}
