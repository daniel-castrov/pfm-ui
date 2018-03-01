import { Component, OnInit, AfterViewInit } from '@angular/core';
import { Input } from '@angular/core';
import { Router, ActivatedRoute, Params } from '@angular/router';
import { Response, ResponseContentType } from '@angular/http';

// Generated
import { AuthUser } from '../../generated/model/authUser';
import { RestResult } from '../../generated/model/restResult';
import { BlankService } from '../../generated/api/blank.service';


import {
  HttpClient, HttpHeaders, HttpParams,
  HttpResponse, HttpEvent
} from '@angular/common/http';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css']
})

export class HeaderComponent implements OnInit {

  authUser:AuthUser;
  authUserJson:string;
  isloggedin:boolean=false;

  constructor(
    private route:ActivatedRoute,
    private router:Router,
    private blankService:BlankService,
  ) {
  }

  ngOnInit() {
    this.getCurrentUser();
  }

  ngAfterViewInit() {
  }

    getCurrentUser() {
      this.blankService.blank("response", true).subscribe(
        (r: HttpResponse<RestResult>) => {
          var authHeader = r.headers.get('Authorization');
          //console.log("Current authHeader: " + authHeader);
          this.authUserJson=atob(authHeader);
          //console.log("Current json: " +this.authUserJson);
          this.authUser = JSON.parse(atob(authHeader));
          //console.log("Current User: " + this.authUser.fullName);
          this.isloggedin = true;
        }
      );
  }
}
