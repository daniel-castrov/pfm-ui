import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Request } from './request';
import { UiLeaveCommunityRequest } from './uiLeaveCommunityRequest';
import { UiJoinCommunityRequest } from './uiJoinCommunityRequest';
import { UiCreateUserRequest } from './uiCreateUserRequest';
import { UiAssignRoleRequest } from './uiAssignRoleRequest';
import { UiDropRoleRequest } from './uiDropRoleRequest';

// Generated
import { User } from '../generated/model/user';
import { UserService } from '../generated/api/user.service';
import { MyDetailsService } from '../generated/api/myDetails.service';
import { CreateUserRequest } from '../generated/model/createUserRequest';
import { CreateUserRequestService } from '../generated/api/createUserRequest.service';
import { JoinCommunityRequest } from '../generated/model/joinCommunityRequest';
import { JoinCommunityRequestService } from '../generated/api/joinCommunityRequest.service';
import { LeaveCommunityRequest } from '../generated/model/leaveCommunityRequest';
import { LeaveCommunityRequestService } from '../generated/api/leaveCommunityRequest.service';
import { AssignRoleRequest } from '../generated/model/assignRoleRequest';
import { AssignRoleRequestService } from '../generated/api/assignRoleRequest.service';
import { DropRoleRequest } from '../generated/model/dropRoleRequest';
import { DropRoleRequestService } from '../generated/api/dropRoleRequest.service';


@Injectable()
export class RequestsService {

  // All Pending Requests for the current user's current community.
  pendingRequests: Request[];

  constructor(
    private myDetailsService: MyDetailsService,
    private createUserRequestService: CreateUserRequestService,
    private joinCommunityRequestService: JoinCommunityRequestService,
    private leaveCommunityRequestService: LeaveCommunityRequestService,
    private userService: UserService,
    private assignRoleRequestService: AssignRoleRequestService,
    private dropRoleRequestService: DropRoleRequestService
  ) {}

  getRequests(): Request[] {
    this.pendingRequests=[];
    this.buildRequests();
    return this.pendingRequests;
  }

  private async buildRequests() {
    
    let currentUser:User = (await this.myDetailsService.getCurrentUser().toPromise()).result;
    let communityId:string  = currentUser.currentCommunityId;
    this.buildJoinCommunityRequests(communityId);
    this.buildLeaveCommunityRequests(communityId);
    this.buildCreateUserRequests(communityId);
    this.buildAssignRoleRequests(communityId);
    this.buildDropRoleRequests(communityId);
    this.sortNotifications(communityId, this.pendingRequests);
  }

  private async buildJoinCommunityRequests(communityId:string) {
    let joinCommReqs: JoinCommunityRequest[]  = (await this.joinCommunityRequestService.getByCommId(communityId).toPromise()).result;
    joinCommReqs.forEach( async request => {
      let user: User = (await this.userService.getById(request.userId).toPromise()).result;
      this.pendingRequests.push(
      new UiJoinCommunityRequest(
        request.id,
        user.firstName + " " + user.lastName,
        request.dateApplied));
    });
  }

  private async buildLeaveCommunityRequests(communityId:string) {
    let leaveCommReqs: LeaveCommunityRequest[]  = (await this.leaveCommunityRequestService.getByCommId(communityId).toPromise()).result;
    leaveCommReqs.forEach( async request => {
      let user: User = (await this.userService.getById( request.userId ).toPromise()).result;
      this.pendingRequests.push(
      new UiLeaveCommunityRequest(
        request.id,
        user.firstName + " " + user.lastName,
        request.dateApplied));
    });
  }

  private async buildCreateUserRequests(communityId:string) {
    let createUserReqs: CreateUserRequest[]  = (await this.createUserRequestService.getByCommId(communityId).toPromise()).result;
    createUserReqs.forEach( request => {
      this.pendingRequests.push(
        new UiCreateUserRequest(
          request.id,
          request.firstName + " " + request.lastName,
          request.dateApplied));
    });
  }

  private async buildAssignRoleRequests(communityId:string) {
    let assignRoleReqs: AssignRoleRequest[]  = (await this.assignRoleRequestService.getByCommId(communityId).toPromise()).result;
    assignRoleReqs.forEach( async request => {
      let user: User = (await this.userService.getById( request.userId ).toPromise()).result;
      this.pendingRequests.push(
      new UiAssignRoleRequest(
        request.id,
        user.firstName + " " + user.lastName,
        request.dateApplied));
    });
  }

  private async buildDropRoleRequests(communityId:string) {
    let dropRoleReqs: DropRoleRequest[]  = (await this.dropRoleRequestService.getByCommId(communityId).toPromise()).result;
    dropRoleReqs.forEach( async request => {
      let user: User = (await this.userService.getById( request.userId ).toPromise()).result;
      this.pendingRequests.push(
      new UiDropRoleRequest(
        request.id,
        user.firstName + " " + user.lastName,
        request.dateApplied));
    });
  }

  private sortNotifications(communityId:string, requestLinks: Request[]) {
    requestLinks.sort(this.compareRequsetLink);
  }

  private compareRequsetLink(a, b) {
    if (a.dateApplied < b.dateApplied)
      return -1;
    if (a.dateApplied > b.dateApplied)
      return 1;
    return 0;
  }

}
