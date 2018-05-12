import { ProgrammaticRequest } from './../../../../generated/model/programmaticRequest';

export class UiProgrammaticRequest {
  constructor(public programmaticRequest: ProgrammaticRequest) {}

  get id():string {return this.programmaticRequest.id;}
  get state():string {return this.programmaticRequest.state;}
  get shortname():string {return this.programmaticRequest.shortname;}
  getToa(year:number): number {
      return this.programmaticRequest.funding.map( (funds) => funds[year] ).reduce((a,b) => a+b);
  }
}