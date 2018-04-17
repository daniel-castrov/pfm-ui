import { Request } from './request';
import { Injectables } from './injectables';

export class UiLeaveCommunityRequest extends Request {
  constructor(requestId: string, name: string, date: string) {
    super(requestId, name, date, Injectables.leaveCommunityRequestService);
  }

  get link(): string {
    return "/community-leave/" + this.requestId;
  }

  get type(): string {
    return "Join Community Request";
  }

  get approveRequestsPageType(): string {
    return "Change Community";
  }

}