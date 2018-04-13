import { Injectable } from '@angular/core';
import { JoinCommunityRequestService } from '../generated/api/joinCommunityRequest.service';
import { LeaveCommunityRequestService } from '../generated/api/leaveCommunityRequest.service';
import { CreateUserRequestService } from './../generated/api/createUserRequest.service';

@Injectable()
export class Injectables {

    static joinCommunityRequestService: JoinCommunityRequestService;
    static leaveCommunityRequestService: LeaveCommunityRequestService;
    static createUserRequestService: CreateUserRequestService;

    constructor(
        joinCommunityRequestService: JoinCommunityRequestService,
        leaveCommunityRequestService: LeaveCommunityRequestService,
        createUserRequestService: CreateUserRequestService
    ) {
        Injectables.joinCommunityRequestService = joinCommunityRequestService;
        Injectables.leaveCommunityRequestService = leaveCommunityRequestService;
        Injectables.createUserRequestService = createUserRequestService;
    }

}
