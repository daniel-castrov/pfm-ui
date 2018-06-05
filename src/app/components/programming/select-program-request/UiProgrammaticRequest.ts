import { ProgrammaticRequest } from './../../../generated/model/programmaticRequest';
import { FundingLine } from '../../../generated/model/fundingLine';

export class UiProgrammaticRequest {
  constructor(public programmaticRequest: ProgrammaticRequest) {}

  get id():string {return this.programmaticRequest.id}
  get state():string {return this.programmaticRequest.state}
  get shortName():string {return this.programmaticRequest.shortName}
  get longName():string {return this.programmaticRequest.longName}
  get fundingLines():FundingLine[] {return this.programmaticRequest.fundingLines}
  get parentId():string {return this.programmaticRequest.parentId}
  get bulkOrigin():boolean {return this.programmaticRequest.bulkOrigin}
  getToa(year:number): any {
      const sum = this.programmaticRequest.fundingLines.map( fundingLine=>fundingLine.funds[year] ).reduce((a,b)=>a+b, 0);
      return isNaN(sum) ? '' : sum;
  }
  get isSubprogram(): boolean {
    return this.programmaticRequest.parentId !== null;
  }
  get isNonVariantSubprogram(): boolean {
    return this.isSubprogram && this.programmaticRequest.type !== 'VARIANT';
  }
  get isVariantSubprogram(): boolean {
    return this.isSubprogram && this.programmaticRequest.type === 'VARIANT';
  }
}