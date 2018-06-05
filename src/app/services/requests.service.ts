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
    var my: RequestsService = this;
    my.pendingRequests=[];
    my.buildRequests();
    return my.pendingRequests;
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
    var my: RequestsService = this;
    let jcr: JoinCommunityRequest[]  = (await my.joinCommunityRequestService.getByCommId(communityId).toPromise()).result;
    jcr.forEach( async x => {
      let user: User = (await my.userService.getById(x.userId).toPromise()).result;
      my.pendingRequests.push(
      new UiJoinCommunityRequest(
        x.id,
        user.firstName + " " + user.lastName,
        x.dateApplied));
    });
  }

  private async buildLeaveCommunityRequests(communityId:string) {
    var my: RequestsService = this;
    let lcr: LeaveCommunityRequest[]  = (await my.leaveCommunityRequestService.getByCommId(communityId).toPromise()).result;
    lcr.forEach( async y => {
      let user: User = (await my.userService.getById( y.userId ).toPromise()).result;
      my.pendingRequests.push(
      new UiLeaveCommunityRequest(
        y.id,
        user.firstName + " " + user.lastName,
        y.dateApplied));
    });
  }

  private async buildCreateUserRequests(communityId:string) {
    var my: RequestsService = this;
    let nur: CreateUserRequest[]  = (await my.createUserRequestService.getByCommId(communityId).toPromise()).result;
    nur.forEach( y => {
      my.pendingRequests.push(
        new UiCreateUserRequest(
          y.id,
          y.firstName + " " + y.lastName,
          y.dateApplied));
    });
  }

  private async buildAssignRoleRequests(communityId:string) {
    var my: RequestsService = this;
    let arr: AssignRoleRequest[]  = (await my.assignRoleRequestService.getByCommId(communityId).toPromise()).result;
    arr.forEach( async y => {
      let user: User = (await my.userService.getById( y.userId ).toPromise()).result;
      my.pendingRequests.push(
      new UiAssignRoleRequest(
        y.id,
        user.firstName + " " + user.lastName,
        y.dateApplied));
    });
  }

  private async buildDropRoleRequests(communityId:string) {
    var my: RequestsService = this;
    let arr: DropRoleRequest[]  = (await my.dropRoleRequestService.getByCommId(communityId).toPromise()).result;
    arr.forEach( async y => {
      let user: User = (await my.userService.getById( y.userId ).toPromise()).result;
      my.pendingRequests.push(
      new UiDropRoleRequest(
        y.id,
        user.firstName + " " + user.lastName,
        y.dateApplied));
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
