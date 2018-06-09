import { Injectable } from '@angular/core';
import { Observable, Subject } from 'rxjs';
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
import { Response } from '@angular/http';


@Injectable()
export class RequestsService {

  constructor(
    private myDetailsService: MyDetailsService,
    private createUserRequestService: CreateUserRequestService,
    private joinCommunityRequestService: JoinCommunityRequestService,
    private leaveCommunityRequestService: LeaveCommunityRequestService,
    private userService: UserService,
    private assignRoleRequestService: AssignRoleRequestService,
    private dropRoleRequestService: DropRoleRequestService
  ) { }

  getRequests(): Observable<Request[]> {

    let observable = new Subject<Request[]>();
    let allRequests: Request[] = [];

    this.myDetailsService.getCurrentUser().subscribe(
      (response) => {

        let communityId: string = response.result.currentCommunityId;

        Promise.all([
          this.getAssignRoleReqs(allRequests, communityId),
          this.getDropRoleReqs(allRequests, communityId),
          this.getJoinCommReqs(allRequests, communityId),
          this.getLeaveCommReqs(allRequests, communityId),
          this.getCreateUserReqs(allRequests, communityId)
        ]).then(
          (requestArrays: any) => {
            requestArrays.forEach(
              (reqArray: Request[]) => {
                allRequests.concat(reqArray);
              });
          });
          observable.next(allRequests);
      });
    return observable;
  }

  // TRY WITH ASYNC and shared parameter

  private async getAssignRoleReqs(allRequests: Request[], communityId: string) {
    let assignRoleReqs: AssignRoleRequest[] = (await this.assignRoleRequestService.getByCommId(communityId).toPromise()).result;
    let promise = new Promise((resolve, reject) => {
      assignRoleReqs.forEach(async request => {
        let user: User = (await this.userService.getById(request.userId).toPromise()).result;
        allRequests.push(
          new UiAssignRoleRequest(
            request.id,
            user.firstName + " " + user.lastName,
            request.dateApplied));
      });
      resolve();
    });
    return promise;
  }

  private async getDropRoleReqs(allRequests: Request[], communityId: string) {
    let dropRoleReqs: DropRoleRequest[] = (await this.dropRoleRequestService.getByCommId(communityId).toPromise()).result;
    let promise = new Promise((resolve, reject) => {
      dropRoleReqs.forEach(async request => {
        let user: User = (await this.userService.getById(request.userId).toPromise()).result;
        allRequests.push(
          new UiDropRoleRequest(
            request.id,
            user.firstName + " " + user.lastName,
            request.dateApplied));
      });
      resolve();
    });
    return promise;
  }

  private async getJoinCommReqs(allRequests: Request[], communityId: string) {
    let joinCommReqs: JoinCommunityRequest[] = (await this.joinCommunityRequestService.getByCommId(communityId).toPromise()).result;
    let promise = new Promise((resolve, reject) => {
      joinCommReqs.forEach(async request => {
        let user: User = (await this.userService.getById(request.userId).toPromise()).result;
        allRequests.push(new UiJoinCommunityRequest(
          request.id,
          user.firstName + " " + user.lastName,
          request.dateApplied)
        );
      });
      resolve();
    });
    return promise;
  }

  private async getLeaveCommReqs(allRequests: Request[], communityId: string) {
    let leaveCommReqs: LeaveCommunityRequest[] = (await this.leaveCommunityRequestService.getByCommId(communityId).toPromise()).result;
    let promise = new Promise<Request[]>((resolve, reject) => {
      leaveCommReqs.forEach(async request => {
        let user: User = (await this.userService.getById(request.userId).toPromise()).result;
        allRequests.push(new UiLeaveCommunityRequest(
          request.id,
          user.firstName + " " + user.lastName,
          request.dateApplied)
        );
      });
      resolve();
    });
    return promise;
  }

  private async getCreateUserReqs(allRequests: Request[], communityId: string) {
    let createUserReqs: CreateUserRequest[] = (await this.createUserRequestService.getByCommId(communityId).toPromise()).result;
    let promise = new Promise((resolve, reject) => {
      createUserReqs.forEach(request => {
        allRequests.push(
          new UiCreateUserRequest(
            request.id,
            request.firstName + " " + request.lastName,
            request.dateApplied));
      });
      resolve();
    });
    return promise;
  }

}
