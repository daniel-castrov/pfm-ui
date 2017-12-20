import { Component, OnInit } from '@angular/core';
import { Input } from '@angular/core';
import { Router, ActivatedRoute, Params } from '@angular/router';
import { PexUser } from '../../generated/model/pexUser';
import { Communication } from '../../generated/model/communication';
import { GrantedAuthority } from '../../generated/model/grantedAuthority';
import { BlankService } from '../../generated/api/blank.service';
import { Response, ResponseContentType } from '@angular/http';

import {
  HttpClient, HttpHeaders, HttpParams,
  HttpResponse, HttpEvent
} from '@angular/common/http';

import { Observable } from 'rxjs/Observable';


@Component({
  selector: 'app-user',
  templateUrl: './user.component.html',
  styleUrls: ['./user.component.css']
})
export class UserComponent implements OnInit {
  //@Input() public title: string;
  @Input() public isUserLoggedIn: boolean;
  @Input() public currentusername: string;

  id: number;
  pexUser: PexUser;
  jsonUser: string;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private blankService: BlankService,
  ) {
    this.route.params.subscribe((params: Params) => {
      this.id = params.id;
    });
  }

  ngOnInit() {
    this.getCurrentUser();
  }

  getCurrentUser() {
    //console.log("getCurrentUser");

    let resp = this.blankService.blank("response", true);

    resp.subscribe(
      (r: HttpResponse<string>) => {
        var authHeader = r.headers.get('Authorization');
        //console.log("HELLO"+authHeader);
        this.jsonUser = atob(authHeader);
        this.pexUser = JSON.parse(this.jsonUser);
        this.donothing();

      }

    );
  }

  donothing() {
    for (let key in this.pexUser.preferences) {
      console.log(key + "," + this.pexUser.preferences[key]);
    }
  }

}
