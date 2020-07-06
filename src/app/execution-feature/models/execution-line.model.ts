import { OSDGoalPlan } from './enumerations/ousd-goal-plan.model';

export class ExecutionLine {
  created: any;
  createdBy: string;
  modified: any;
  modifiedBy: string;

  id: string;
  containerId?: string;
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

  fullNameCreatedBy?: string;
  fullNameModifiedBy?: string;

  constructor() {}
}
