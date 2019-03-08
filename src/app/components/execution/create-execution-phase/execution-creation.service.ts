import {Injectable} from "@angular/core";
import {join} from "../../../utils/join";
import {Budget, BudgetService, Execution, ExecutionService} from "../../../generated";

@Injectable()
export class ExecutionCreationService {

  constructor( private executionService: ExecutionService,
               private budgetService: BudgetService ) {}

  async getBudgetsReadyForExecutionPhaseCreation() {
    const [executions, budgets] = await join(this.executionService.getAll(), this.budgetService.getAll()) as [Execution[], Budget[]];

    const existingExecutionYears = new Set<number>();
    executions.forEach((execution: Execution) => {
      existingExecutionYears.add(execution.fy);
    });

    const result: Budget[] = [];
    budgets.forEach(budget => {
      if (!existingExecutionYears.has(budget.fy) && budget.status === Budget.StatusEnum.CLOSED) {
        result.push(budget);
      }
    });

    return result;
  }
}
