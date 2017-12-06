import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute, Params } from '@angular/router';
import { UserComponent } from '../user/user.component';
import { PexUser } from '../../generated/model/PexUser';
import { BlankApi } from '../../generated/api/BlankApi';

import { Response, ResponseContentType }                     from '@angular/http';

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

  constructor(
    private route:ActivatedRoute,
    private router:Router,
    private blankApi:BlankApi,
  ) {
    this.route.params.subscribe((params:Params) => {
      this.id = params.id;
    });
  }

  ngOnInit() {
    this.getCurrentUser();
  }

    getCurrentUser() {
      this.blankApi.blankWithHttpInfo().subscribe(
        (r: Response) => {
          var authHeader = r.headers.get('Authorization')
          var jsonuser = atob(authHeader);
          this.pexUser = JSON.parse(jsonuser);
      });
    }

  }