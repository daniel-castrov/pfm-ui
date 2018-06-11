import { Request } from './request';
import { Injectables } from './injectables';

export class UiAssignRoleRequest extends Request {
  constructor(requestId: string, name: string, date: string) {
    super(requestId, name, date, Injectables.assignRoleRequestService);
  }

  get link(): string {
    return "/role-approve/assign/" + this.requestId;
  }

  get type(): string {
    return "Assign Role Request";
  }

  get approveRequestsPageType(): string {
    return "Assign Role";
  }

}