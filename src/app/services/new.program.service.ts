import {Injectable} from '@angular/core';
import 'rxjs/add/operator/map'
import {TagsService, TagType} from "./tags.service";
import {ProgrammaticRequest, UFR} from "../generated";

@Injectable()
export class NewProgramService {

  constructor(private tagsService: TagsService) {}

  public async initRequiredFieldsWithSomeValues(prOrUfr: ProgrammaticRequest | UFR) {
    this.initRequiredFieldWithSomeValue(prOrUfr, 'leadComponent', TagType.LEAD_COMPONENT);
    this.initRequiredFieldWithSomeValue(prOrUfr, 'manager', TagType.MANAGER);
    this.initRequiredFieldWithSomeValue(prOrUfr, 'primaryCapability', TagType.PRIMARY_CAPABILITY);
    this.initRequiredFieldWithSomeValue(prOrUfr, 'coreCapability', TagType.CORE_CAPABILITY_AREA);
    this.initRequiredFieldWithSomeValue(prOrUfr, 'functionalArea', TagType.FUNCTIONAL_AREA);
  }

  private async initRequiredFieldWithSomeValue(prOrUfr: ProgrammaticRequest | UFR, field: string, tagType: TagType) {
    prOrUfr[field] = (await this.tagsService.tags(tagType).toPromise())[0].abbr;
  }
}
