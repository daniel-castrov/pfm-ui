export interface IExecutionLine {
  id?: string;
  phaseId?: string;
  initial?: number;
  appropriated?: boolean;
  hasTransactions?: boolean;
  appropriation?: string;
  blin?: string;
  opAgency?: string;
  item?: string;
  programElement?: string;
  programName?: string;
}

export class ExecutionLine implements IExecutionLine {
  constructor(
    public id?: string,
    public phaseId?: string,
    public initial?: number,
    public appropriated?: boolean,
    public hasTransactions?: boolean,
    public appropriation?: string,
    public blin?: string,
    public opAgency?: string,
    public item?: string,
    public programElement?: string,
    public programName?: string
  ) {}
}
