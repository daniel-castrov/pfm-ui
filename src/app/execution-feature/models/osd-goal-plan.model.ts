import { PlanType } from './plan-type.model';

export class OSDGoalPlan {
  monthlies: number[];
  type: PlanType = PlanType.OBLIGATION;
}
