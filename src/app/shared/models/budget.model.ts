import { BudgetStatus } from './enumerations/budget-status.model';

export interface IBudget {
  id?: string;
  fy?: number;
  status?: BudgetStatus;
}

export class Budget implements IBudget {
  constructor(
    public id?: string,
    public fy?: number,
    status?: BudgetStatus
  ) {}
}
