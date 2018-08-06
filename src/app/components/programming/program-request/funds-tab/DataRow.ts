import { FundingLine } from './../../../../generated/model/fundingLine';
import {PhaseType} from "../../select-program-request/UiProgrammaticRequest";

export class DataRow {
  phaseType: PhaseType;
  fundingLine: FundingLine;

  constructor() {}
}
