import { ProgrammaticRequest } from './../../../../generated/model/programmaticRequest';
import { FundingLine } from '../../../../generated/model/fundingLine';
import { UiProgrammaticRequest } from './UiProgrammaticRequest';

export class Row {

  pom: UiProgrammaticRequest;
  pb: UiProgrammaticRequest;

  addPomPr(pr: ProgrammaticRequest) {
    this.pom = new UiProgrammaticRequest(pr);
  }

  addPbPr(pr: ProgrammaticRequest) {
    this.pb = new UiProgrammaticRequest(pr);
  }
}