import { FundingLine } from './../../../../generated/model/fundingLine';
import {GridType} from "../../../programming/program-request/funds-tab/GridType";

export class DataRow {
  type?;
  editable: boolean;
  fundingLine: FundingLine;
  gridType: GridType;
  constructor() {}
}
