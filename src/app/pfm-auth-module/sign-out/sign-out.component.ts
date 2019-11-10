import { Component, OnInit } from '@angular/core';
import { AppModel } from '../../../../projects/shared/src/lib/models/AppModel';
import { Router } from '@angular/router';

@Component({
  selector: 'app-sign-out',
  templateUrl: './sign-out.component.html',
  styleUrls: ['./sign-out.component.css']
})
export class SignOutComponent implements OnInit {

  constructor(private appModel:AppModel, private router:Router) { }

  ngOnInit() {

    setTimeout(()=>{
      this.appModel.isUserSignedIn = undefined;
      sessionStorage.removeItem("auth_token");
      sessionStorage.removeItem("app_model");
      this.router.navigate(['/signin']);
    });

  }

}
