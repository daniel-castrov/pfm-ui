import { Request } from './request';
import { Injectables } from './injectables';

export class UiJoinCommunityRequest extends Request {
  constructor(requestId: string, name: string, date: string) {
    super(requestId, name, date, Injectables.joinCommunityRequestService);
  }

  get link(): string {
    return "/community-join/" + this.requestId;
  }

  get type(): string {
    return "Join Community Request";
  }

  get approveRequestsPageType(): string {
    return "Change Community";
  }

}