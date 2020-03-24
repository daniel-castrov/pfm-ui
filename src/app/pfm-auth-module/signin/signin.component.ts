import { Component, OnInit } from '@angular/core';
import { SigninService } from '../services/signin.service';
import { Router } from '@angular/router';
import { AppModel } from '../../pfm-common-models/AppModel';
import { UserRole } from '../../pfm-common-models/UserRole';
import { DialogService } from '../../pfm-coreui/services/dialog.service';
import { CommunityService } from '../../services/community-service';
import { MessageService } from 'primeng/api';

@Component({
  selector: 'app-signin',
  templateUrl: './signin.component.html',
  styleUrls: ['./signin.component.css']
})
export class SigninComponent implements OnInit {

  busy: boolean;

  constructor(private appModel: AppModel,
              private communityService: CommunityService,
              private dialogService: DialogService,
              private signInService: SigninService,
              private router: Router,
              private messageService: MessageService) {
  }

  onLoginClick(): void {
    this.busy = true;
    this.signInService.signIn().subscribe(
      resp => {
        this.messageService.add({
          severity: 'warn',
          summary: 'Warn Message',
          detail: 'Last Login at Mon, 16 Mar 2020 14:25:46'
        });
        this.appModel.isUserSignedIn = true;
        this.getUserDetails();
      },
      error => {
        this.busy = false;
        this.dialogService.displayDebug(error);
      }
    );
  }

  private getUserDetails(): void {
    this.signInService.getUserDetails().subscribe(
      resp => {
        this.appModel.userDetails = (resp as any).result;
        this.appModel.userDetails.fullName = this.appModel.userDetails.firstName + ' ' +
          this.appModel.userDetails.lastName;
        this.communityService.getCommunity(this.appModel.userDetails.currentCommunityId).toPromise().then(
          communityResp => {
            this.appModel.userDetails.currentCommunity = (communityResp as any).result;
          });
        this.getUserRoles();
      },
      error => {
        this.busy = false;
        this.dialogService.displayDebug(error);
      }
    );
  }

  private getUserRoles(): void {
    this.signInService.getUserRoles().subscribe(
      resp => {
        this.busy = false;
        this.appModel.userDetails.userRole = new UserRole((resp as any).result as string[]);
        this.appModel.userDetails.userRole.isAdmin = this.appModel.userDetails.admin;

        const json: string = JSON.stringify(this.appModel);
        sessionStorage.setItem('app_model', json);

        this.router.navigate(['/home']);
      },
      error => {
        this.busy = false;
        this.dialogService.displayDebug(error);
      }
    );
  }

  ngOnInit() {
  }

}
