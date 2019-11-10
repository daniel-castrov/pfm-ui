import { Component, OnInit } from '@angular/core';
import { AppModel } from '../../projects/shared/src/lib/models/AppModel';
import { AuthorizationService } from './pfm-auth-module/services/authorization.service';
import { onMainContentChange, onSideNavChange } from './pfm-coreui/menu-bar/animation';
import { UserRole } from '../../projects/shared/src/lib/models/UserRole';
import { UserDetailsModel } from '../../projects/shared/src/lib/models/UserDetailsModel';
import { Router } from '@angular/router';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
  animations: [ onMainContentChange, onSideNavChange]
})
export class AppComponent implements OnInit {

  sideNavState:boolean;
  linkText:boolean;

  constructor(public appModel:AppModel, private authService:AuthorizationService, private router:Router) {}

  onSidenavToggle(){
    this.sideNavState = !this.sideNavState;
    setTimeout(()=>{
      this.linkText = this.sideNavState;
    }, 200);
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
}
