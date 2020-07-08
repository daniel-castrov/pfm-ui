import { OSDGoalPlan } from './enumerations/ousd-goal-plan.model';

export class ExecutionLine {
  created?: any;
  createdBy?: string;
  modified?: any;
  modifiedBy?: string;

  id: string;
  containerId: string;
  intial: number;
  appropriated: boolean;
  hasTransactions: boolean;
  appropriation: string;
  blin: string;
  opAgency: string;
  item: string;
  programElement: string;
  programName: string;
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

  constructor() {}
}
