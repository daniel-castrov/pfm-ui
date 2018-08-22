import {PhaseType} from "../../select-program-request/UiProgrammaticRequest";
import {IntMap} from "../../../../generated";

export class DataRow {
  phaseType: PhaseType;
  quantities: IntMap;
  service: string;
  contractor: string;
  unitCost: number;

  constructor() {}
}
