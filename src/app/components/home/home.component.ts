import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute, Params } from '@angular/router';
import { UserComponent } from '../user/user.component';
import { PexUser } from '../../generated/model/pexUser';
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
  pexUser:PexUser;
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
        (r: HttpResponse<string>) => {
          var authHeader = r.headers.get('Authorization');
          //console.log("HELLO"+authHeader);
          var jsonuser = atob(authHeader);
          this.pexUser = JSON.parse(jsonuser);

          console.log(this.pexUser.preferences);


          console.log(this.pexUser.preferences[0]);

          this.jsonUser = jsonuser;
        }

      );
    }

    donothing(){

    
    for (let i of this.pexUser.authorities){
      i.authority;
    }    

    console.log(this.pexUser.preferences);
  }

  }