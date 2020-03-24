import { RoleConstants } from './RoleConstants';

export class UserRole {

  isAdmin: boolean;
  isBudgetManager: boolean;
  isPOMManager: boolean;
  isFundsRequestor: boolean;
  isProgramManager: boolean;
  isExecutionManager: boolean;
  isExecutionReporter: boolean;
  isUserApprover: boolean;
  isUser: boolean;
  isOrganizationMember: boolean;
  isFinancialManager: boolean;

  constructor(roles: string[]) {

    if (roles.includes(RoleConstants.BUDGET_MANAGER)) {
      this.isBudgetManager = true;
    }
    if (roles.includes(RoleConstants.POM_MANAGER)) {
      this.isPOMManager = true;
    }
    if (roles.includes(RoleConstants.FUNDS_REQUESTOR)) {
      this.isFundsRequestor = true;
    }
    if (roles.includes(RoleConstants.PROGRAM_MANAGER)) {
      this.isProgramManager = true;
    }
    if (roles.includes(RoleConstants.EXECUTION_MANAGER)) {
      this.isExecutionManager = true;
    }
    if (roles.includes(RoleConstants.EXECUTION_REPORTER)) {
      this.isExecutionReporter = true;
    }
    if (roles.includes(RoleConstants.USER_APPROVER)) {
      this.isUserApprover = true;
    }
    if (roles.includes(RoleConstants.USER)) {
      this.isUser = true;
    }
    if (roles.includes(RoleConstants.ORGANIZATION_MEMBER)) {
      this.isOrganizationMember = true;
    }
    if (roles.includes(RoleConstants.FINANCIAL_MANAGER)) {
      this.isFinancialManager = true;
    }
  }
}
