import { ExecutionLineWrapper } from "./execution-line-wrapper";

export interface ExecutionTableCalculator {
    (x: ExecutionLineWrapper[]): boolean[];
}
