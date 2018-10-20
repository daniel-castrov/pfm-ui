import { Observable } from 'rxjs/Observable';
import { RestResult } from '../generated/model/restResult';
import { Injectable } from '@angular/core';
import 'rxjs/add/operator/map'
import { ProgramsService } from '../generated/api/programs.service';
import { Tag } from '../generated/model/tag';
import {CacheService} from "./caching";


export enum TagType {
  LEAD_COMPONENT = 'Lead Component',
  MANAGER = 'Manager',
  PRIMARY_CAPABILITY = 'Primary Capability',
  CORE_CAPABILITY_AREA = 'Core Capability Area',
  SECOMDARY_CAPABILITY = 'Secondary Capability',
  FUNCTIONAL_AREA = 'Functional Area',
  MEDICAL_CATEGORY = 'Medical Category',
  DASD_CBD = 'DASD CBD',
  EMPHASIS_AREA = 'Emphasis Areas',
  OP_AGENCY = 'OpAgency (OA)',
  APPROPRIATION = 'Appropriation',
  BLIN = 'BLIN',
  BA = 'BA',
  ACQUISITION_TYPE = 'Acquisition Type'
}

@Injectable()
export class TagsService {

  constructor(private programsService: ProgramsService) {}

  tags(tagType: TagType): Observable<Tag[]> {
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

  private tagAbbreviations(tagType: TagType): Promise<string[]> {
    return this.tags(tagType)
            .map((tags: Tag[]) => tags.map((tag:Tag)=>tag.abbr))
            .map((tags: string[]) => tags.sort())
            .toPromise();
  }

  tagAbbreviationsForOpAgency(): Promise<string[]> {
    return this.tagAbbreviations(TagType.OP_AGENCY);
  }

  tagAbbreviationsForAppropriation(): Promise<string[]> {
    return this.tagAbbreviations(TagType.APPROPRIATION);
  }

  tagAbbreviationsForBlin(): Promise<string[]> {
    return this.tagAbbreviations(TagType.BLIN);
  }

  tagAbbreviationsForBa(): Promise<string[]> {
    return this.tagAbbreviations(TagType.BA);
  }

  tagAbbreviationsForAcquisitionType(): Promise<string[]> {
    return this.tagAbbreviations(TagType.ACQUISITION_TYPE);
  }

  tagAbbreviationsForFunctionalArea(): Promise<string[]> {
    return this.tagAbbreviations(TagType.FUNCTIONAL_AREA);
  }

}
