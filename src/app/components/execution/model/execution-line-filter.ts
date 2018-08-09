import { ExecutionLine } from "../../../generated";

export interface ExecutionLineFilter {
    (x: ExecutionLine): boolean;
}
