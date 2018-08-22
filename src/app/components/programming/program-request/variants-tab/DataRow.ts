import {PhaseType} from "../../select-program-request/UiProgrammaticRequest";
import {IntMap} from "../../../../generated";

export interface DataRow {
  phaseType: PhaseType;
  quantities: IntMap;
  service: string;
  contractor: string;
  unitCost: number;
}
