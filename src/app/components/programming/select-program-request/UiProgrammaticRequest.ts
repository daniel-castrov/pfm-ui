import { ProgramRequestWithFullName } from './../../../services/with-full-name.service';
import { FundingLine } from '../../../generated/model/fundingLine';
import { ProgramType } from '../../../generated';

export class UiProgrammaticRequest {
  constructor(public pr: ProgramRequestWithFullName) {}
  phaseType: PhaseType
  get id():string {return this.pr.id}
  get state():string {return this.pr.state}
  get shortName():string {return this.pr.shortName}
  get fullname():string {return this.pr.fullname}
  get longName():string {return this.pr.longName}
  get fundingLines():FundingLine[] {return this.pr.fundingLines}
  get parentId():string {return this.pr.parentMrId}
  get bulkOrigin():boolean {return this.pr.bulkOrigin}
  getToa(year:number): number {
    if(this.pr.type == ProgramType.GENERIC) {
      return 0;
    } else {
      return this.pr.fundingLines
          .map( fundingLine => fundingLine.funds[year] ? fundingLine.funds[year] : 0 )
          .reduce((a,b)=>a+b, 0);
    }
  }
}

export enum PhaseType {
  POM = 'pom',
  PB = 'pb'
}
