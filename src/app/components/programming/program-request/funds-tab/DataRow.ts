import { FundingLine } from './../../../../generated/model/fundingLine';
import {PhaseType} from "../../select-program-request/UiProgrammaticRequest";
import {GridType} from "./GridType";

export class DataRow {
  programId: string;
  gridType: GridType;
  phaseType: PhaseType;
  fundingLine: FundingLine;

  constructor() {}
}
