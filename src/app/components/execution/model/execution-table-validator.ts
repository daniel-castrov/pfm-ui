import { ExecutionLineWrapper } from "./execution-line-wrapper";

export interface ExecutionTableValidator {
    (x: ExecutionLineWrapper[], totalamt:boolean): boolean[];
}
