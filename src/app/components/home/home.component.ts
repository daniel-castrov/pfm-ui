import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute, Params } from '@angular/router';
import { UserComponent } from '../user/user.component';
import { User } from '../../generated/model/user';
import { RestResult } from '../../generated/model/restResult';
import { Communication } from '../../generated/model/communication';
import { GrantedAuthority } from '../../generated/model/grantedAuthority';

import { BlankService } from '../../generated/api/blank.service';

import { Response, ResponseContentType }                     from '@angular/http';

import { HttpClient, HttpHeaders, HttpParams,
  HttpResponse, HttpEvent }                           from '@angular/common/http';

import { Observable }                                        from 'rxjs/Observable';


@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {

  fireEvent(e){
    //console.log('button clicked');
    console.log(e.type);
  }

  id: number;
  pexUser:User;
  jsonUser:string;

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

    getCurrentUser() {
      //console.log("getCurrentUser");
      
      let resp = this.blankService.blank("response", true);

      resp.subscribe(
        (r: HttpResponse<RestResult>) => {
          var authHeader = r.headers.get('Authorization');
          //console.log("HELLO"+authHeader);
          this.jsonUser = atob(authHeader);
          this.pexUser = JSON.parse(this.jsonUser);

        }

      );
    }

  }