import { Request } from './request';
import { Injectables } from './injectables';

export class UiDropRoleRequest extends Request {
  constructor(requestId: string, name: string, date: string) {
    super(requestId, name, date, Injectables.dropRoleRequestService);
  }

  get link(): string {
    return "/role-approve/drop/" + this.requestId;
  }

  get type(): string {
    return "Drop Role Request";
  }

  get approveRequestsPageType(): string {
    return "Drop Role";
  }

}