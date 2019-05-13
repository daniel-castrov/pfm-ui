import { Injectable } from '@angular/core';
import { JoinCommunityRequestService } from '../generated/api/joinCommunityRequest.service';
import { LeaveCommunityRequestService } from '../generated/api/leaveCommunityRequest.service';
import { CreateUserRequestService } from '../generated/api/createUserRequest.service';
import { AssignRoleRequestService } from '../generated/api/assignRoleRequest.service';
import { DropRoleRequestService } from '../generated/api/dropRoleRequest.service';

@Injectable({
  providedIn: 'root'
})
export class Injectables {

    static joinCommunityRequestService: JoinCommunityRequestService;
    static leaveCommunityRequestService: LeaveCommunityRequestService;
    static createUserRequestService: CreateUserRequestService;
    static assignRoleRequestService: AssignRoleRequestService;
    static dropRoleRequestService: DropRoleRequestService;

    constructor(
        joinCommunityRequestService: JoinCommunityRequestService,
        leaveCommunityRequestService: LeaveCommunityRequestService,
        createUserRequestService: CreateUserRequestService,
        assignRoleRequestService: AssignRoleRequestService,
        dropRoleRequestService: DropRoleRequestService
    ) {
        Injectables.joinCommunityRequestService = joinCommunityRequestService;
        Injectables.leaveCommunityRequestService = leaveCommunityRequestService;
        Injectables.createUserRequestService = createUserRequestService;
        Injectables.assignRoleRequestService = assignRoleRequestService;
        Injectables.dropRoleRequestService = dropRoleRequestService;
        
    }

}
