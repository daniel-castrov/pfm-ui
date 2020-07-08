import { OSDGoalPlan } from './enumerations/ousd-goal-plan.model';

export class ExecutionLine implements IExecutionLine {
  created?: any;
  createdBy?: string;
  modified?: any;
  modifiedBy?: string;

  spendPlans: OSDGoalPlan;

  toa?: number;
  released?: number;
  withheld?: number;
  commitments?: number;
  obligations?: number;
  accruals?: number;
  expenses?: number;
  craTotal?: number;
  apprTotal?: number;
  ousdcTotal?: number;
  btrTotal?: number;
  realignedTotal?: number;
  amount?: number;

  fullNameCreatedBy?: string;
  fullNameModifiedBy?: string;

  executionLine?: string;
  fy?: number;

  actions?: any;
  isDisabled?: boolean;
  isTotalRow?: boolean;

  constructor(
    public id?: string,
    public containerId?: string,
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

export interface IExecutionLine {
  id?: string;
  containerId?: string;
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
