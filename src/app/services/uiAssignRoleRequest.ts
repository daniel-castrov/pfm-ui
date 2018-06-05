import { Request } from './request';
import { Injectables } from './injectables';

export class UiAssignRoleRequest extends Request {
  constructor(requestId: string, name: string, date: string) {
    super(requestId, name, date, Injectables.createUserRequestService);
  }

  get link(): string {
    //return "/role-assign-approval/" + this.requestId;
    return "/not-implemented";
  }

  get type(): string {
    return "Assign Role Request";
  }

  get approveRequestsPageType(): string {
    return "Assign Role";
  }

}