import { Request } from './request';
import { Injectables } from './injectables';

export class UiCreateUserRequest extends Request {
  constructor(requestId: string, name: string, date: string) {
    super(requestId, name, date, Injectables.createUserRequestService);
  }

  get link(): string {
    return "/user-approval/" + this.requestId;
  }

  get type(): string {
    return "Join Community Request";
  }

  get approveRequestsPageType(): string {
    return "Change Community";
  }

}