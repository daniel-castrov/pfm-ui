import { Component, OnInit } from '@angular/core';
import { AppModel } from './pfm-common-models/AppModel';
import { AuthorizationService } from './pfm-auth-module/services/authorization.service';
import { onMainContentChange, onSideNavChange } from './pfm-coreui/menu-bar/animation';
import { UserRole } from './pfm-common-models/UserRole';
import { UserDetailsModel } from './pfm-common-models/UserDetailsModel';
import { Router } from '@angular/router';
import { MenuBarItem } from './pfm-coreui/models/MenuBarItem';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
  animations: [ onMainContentChange, onSideNavChange]
})
export class AppComponent implements OnInit {

  sideNavState:boolean;
  linkText:boolean;
  isSideMenuOpen:boolean;

  constructor(public appModel:AppModel, private authService:AuthorizationService, private router:Router) {}

  onMenuToogle(newValue):void{
    this.isSideMenuOpen = newValue;
  }

  ngOnInit() {
    let json:string = sessionStorage.getItem("app_model");

    if(json){
      let temp:AppModel = JSON.parse(json);
      this.appModel.userDetails = temp.userDetails;
      this.appModel.isUserSignedIn = this.authService.isAuthenticated()
    }
    else{
      this.appModel.isUserSignedIn = false;
      this.appModel.userDetails = new UserDetailsModel();
      this.appModel.userDetails.userRole = new UserRole([""]);
      this.router.navigate(["signin"]);
    }
  }

  private buildSiteMenuItems():void{
    let menuBarItems:MenuBarItem[] = [];

  }
}
