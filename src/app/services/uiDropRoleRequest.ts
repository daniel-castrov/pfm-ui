import { Request } from './request';
import { Injectables } from './injectables';

export class UiDropRoleRequest extends Request {
  constructor(requestId: string, name: string, date: string) {
    super(requestId, name, date, Injectables.createUserRequestService);
  }

  get link(): string {
    //return "/role-drop-approval/" + this.requestId;
    return "/not-implemented";
  }

  get type(): string {
    return "Drop Role Request";
  }

  get approveRequestsPageType(): string {
    return "Drop Role";
  }

}