import { ProgrammaticRequest } from './../../../generated/model/programmaticRequest';
import { FundingLine } from '../../../generated/model/fundingLine';

export class UiProgrammaticRequest {
  constructor(public programmaticRequest: ProgrammaticRequest) {}

  get id():string {return this.programmaticRequest.id;}
  get state():string {return this.programmaticRequest.state;}
  get shortName():string {return this.programmaticRequest.shortName;}
  get fundingLines():FundingLine[] {return this.programmaticRequest.fundingLines;}
  getToa(year:number): any {
      const sum = this.programmaticRequest.fundingLines.map( fundingLine=>fundingLine.funds[year] ).reduce((a,b)=>a+b, 0);
      return isNaN(sum) ? '' : sum;
  }
}