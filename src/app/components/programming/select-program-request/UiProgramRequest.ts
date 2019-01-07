import { ProgramRequestWithFullName } from '../../../services/with-full-name.service';
import { FundingLine } from '../../../generated/model/fundingLine';
import { ProgramType } from '../../../generated';

export class UiProgramRequest {
  constructor(public pr: ProgramRequestWithFullName) {}
  phaseType: PhaseType
  //This variable is used for the tree functionality in the summary of program request page
  dataPath: string[];
  get id():string {return this.pr.id}
  get state():string {return this.pr.programStatus}
  get shortName():string {return this.pr.shortName}
  get fullname():string {return this.pr.fullname}
  get longName():string {return this.pr.longName}
  get fundingLines():FundingLine[] {return this.pr.fundingLines}
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
  POM = 'POM',
  PB = 'PB',
  DELTA = 'Delta'
}
