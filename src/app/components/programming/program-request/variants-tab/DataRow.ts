import {PhaseType} from "../../select-program-request/UiProgramRequest";
import {ServiceLine} from "../../../../generated";

export class DataRow {
  phaseType: PhaseType;
  serviceLine: ServiceLine;
  variantName: string;

  constructor() {}
}
