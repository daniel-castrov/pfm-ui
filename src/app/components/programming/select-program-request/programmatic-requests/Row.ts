import { ProgramRequestWithFullName } from './../../../../services/with-full-name.service';
import { UiProgrammaticRequest } from './../UiProgrammaticRequest';

export class Row {

  pom: UiProgrammaticRequest;
  pb: UiProgrammaticRequest;

  constructor(pr: ProgramRequestWithFullName) {
    this.pom = new UiProgrammaticRequest(pr);
  }

  addPbPr(pr: ProgramRequestWithFullName) {
    this.pb = new UiProgrammaticRequest(pr);
  }
}