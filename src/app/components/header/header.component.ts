import { Component, OnInit } from '@angular/core';
import { Input } from '@angular/core';
import { Router, ActivatedRoute, Params } from '@angular/router';
import { UserComponent } from '../user/user.component';
import { User } from '../../generated/model/user';
import { RestResult } from '../../generated/model/restResult';
import { GrantedAuthority } from '../../generated/model/grantedAuthority';
import { Communication } from '../../generated/model/communication';
import { BlankService } from '../../generated/api/blank.service';
import { Response, ResponseContentType } from '@angular/http';

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

  //@Input() public title: string;
  //@Input() public isUserLoggedIn: boolean;
  //isloggedin:boolean;
  //@output() loggedin: EventEmitter<boolean> = new EventEmitter<boolean>();

  id: number;
  pexUser:User;
  isloggedin:boolean;

  constructor(
    private route:ActivatedRoute,
    private router:Router,
    private blankService:BlankService,
  ) {
    this.route.params.subscribe((params:Params) => {
      this.id = params.id;
    });
  }

  ngOnInit() {
    this.getCurrentUser();
  }

  ngAfterViewInit() {
    this.isloggedin=true;
  }

    getCurrentUser() {
      //console.log("getCurrentUser");

      let resp = this.blankService.blank("response", true);

      resp.subscribe(
        (r: HttpResponse<RestResult>) => {
          var authHeader = r.headers.get('Authorization');
          this.pexUser = JSON.parse(atob(authHeader));
        }
      );
      this.isloggedin=false;
  }
}
