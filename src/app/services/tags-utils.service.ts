import {Observable} from 'rxjs';
import {RestResult} from '../generated/model/restResult';
import {Injectable} from '@angular/core';
import {Tag} from '../generated/model/tag';
import {CacheService} from './caching';
import {TagsService} from '../generated';
import {map} from 'rxjs/operators';


export enum TagType {
  LEAD_COMPONENT = 'Lead Component',
  MANAGER = 'Manager',
  PRIMARY_CAPABILITY = 'Primary Capability',
  CORE_CAPABILITY_AREA = 'Core Capability Area',
  SECONDARY_CAPABILITY = 'Secondary Capability',
  FUNCTIONAL_AREA = 'Functional Area',
  MEDICAL_CATEGORY = 'Medical Category',
  DASD_CBD = 'DASD CBD',
  EMPHASIS_AREA = 'Emphasis Areas',
  OP_AGENCY = 'OpAgency (OA)',
  APPROPRIATION = 'Appropriation',
  BLIN = 'BLIN',
  BA = 'BA',
  ACQUISITION_TYPE = 'Acquisition Type',
  REASON_CODE = 'Reason Code',
  ITEM = 'Item',
  PROGRAM_ELEMENT = 'Program Element',
  EXECUTION_TRANSACTION = 'Execution Transaction'
}

@Injectable({
  providedIn: 'root'
})
export class TagsUtils {

  constructor(private tagsService: TagsService) {}

  private comparator = (a: Tag, b: Tag) => {
    if (a.abbr === b.abbr) return 0;
    return (a.abbr < b.abbr ? -1 : 1);
  }

  private resultGetter: (TagType, boolean) => Observable<Tag[]> = (tagType:TagType, sorting: boolean = true) => this.tagsService.getTagsByType(tagType)
    .pipe(map((result: RestResult) => result.result))
    .pipe(map( (tags: Tag[]) => sorting ? tags.sort(this.comparator) : tags));

  tags(tagType: TagType, caching: boolean = true, sorting: boolean = true): Observable<Tag[]> {
    if (caching) {
      return CacheService.caching(tagType, ()=>this.resultGetter(tagType, sorting));
    } else {
      return this.resultGetter(tagType, sorting);
    }
  }

  name(tagType: TagType, abbreviation: string): Observable<string> {
    return this.tags(tagType)
        .pipe(map(tags => tags.find(tag => tag.abbr === abbreviation)))
        .pipe(map(tag => tag && tag.name));
  }

  private tagAbbreviations(tagType: TagType, caching: boolean = true, sorting: boolean = true): Promise<string[]> {
    return this.tags(tagType, caching, sorting)
            .pipe(map((tags: Tag[]) => tags.map((tag:Tag)=>tag.abbr)))
            .pipe(map((tags: string[]) => tags.sort()))
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

  tagAbbreviationsForReasonCode(): Promise<string[]> {
    return this.tagAbbreviations(TagType.REASON_CODE, false);
  }

}
