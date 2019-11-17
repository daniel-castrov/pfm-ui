import { Component, OnInit } from '@angular/core';
import { SigninService } from '../services/signin.service';
import { Router } from '@angular/router';
import { AppModel } from '../../pfm-common-models/AppModel';
import { UserDetailsModel } from '../../pfm-common-models/UserDetailsModel';
import { UserRole } from '../../pfm-common-models/UserRole';
import { DialogService } from '../../pfm-coreui/services/dialog.service';
import { CommunityModel } from '../../pfm-common-models/CommunityModel';

@Component({
  selector: 'app-signin',
  templateUrl: './signin.component.html',
  styleUrls: ['./signin.component.css']
})
export class SigninComponent implements OnInit {

  busy:boolean;

  constructor(private appModel:AppModel, private signInService:SigninService, private dialogService:DialogService, private router:Router) { }

  onLoginClick():void{
    this.busy = true;
    this.signInService.signIn().subscribe(
      resp => {
        let respx:any = resp;
        let authToken:string = respx.headers.get("Authorization");
        let auth:any = JSON.parse(atob(authToken));

        sessionStorage.setItem("auth_token", authToken);
        this.appModel.isUserSignedIn = true;
        this.getUserDetails(auth);
      },
      error =>{
        this.busy = false;
        this.dialogService.displayDebug(error);
      }
    )
  }

  private getUserDetails(auth:any):void{
    this.signInService.getUserDetails().subscribe(
      resp => {
        this.appModel.userDetails = (resp as any).result;
        this.appModel.userDetails.fullName = auth.fullName;
        this.appModel.userDetails.currentCommunity = auth.currentCommunity;
        this.getUserRoles();
      },
      error =>{
        this.busy = false;
        this.dialogService.displayDebug(error);
      }
    )
  }

  private getUserRoles():void{
    this.signInService.getUserRoles().subscribe(
      resp => {
        this.busy = false;
        this.appModel.userDetails.userRole = new UserRole((resp as any).result as string[]);
        this.appModel.userDetails.userRole.isAdmin = this.appModel.userDetails.admin;

        let json:string = JSON.stringify(this.appModel);
        sessionStorage.setItem("app_model", json);

        this.router.navigate(["/home"]);
      },
      error =>{
        this.busy = false;
        this.dialogService.displayDebug(error);
      }
    )
  }

  ngOnInit() {
  }

}
