import { ExecutionStatus } from './execution-status.model';
import { OSDGoalPlan } from './osd-goal-plan.model';

export interface IExecution {
  id?: string;
  fy?: number;
  status?: ExecutionStatus;
  fileId?: string;
  osdObligationGoals?: { [key: string]: OSDGoalPlan };
  osdExpenditureGoals?: { [key: string]: OSDGoalPlan };
}

export class Execution implements IExecution {
  constructor(
    public id?: string,
    public fy?: number,
    public status?: ExecutionStatus,
    public fileId?: string,
    public osdObligationGoals?: { [key: string]: OSDGoalPlan },
    public osdExpenditureGoals?: { [key: string]: OSDGoalPlan }
  ) {}
}
