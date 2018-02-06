import { Component, OnInit, ViewChild } from '@angular/core';
import { UserComponent } from '../user/user.component';
import { User } from '../../generated/model/user';
import { RestResult } from '../../generated/model/restResult';
import { Communication } from '../../generated/model/communication';
import { GrantedAuthority } from '../../generated/model/grantedAuthority';
import { HeaderComponent } from '../../components/header/header.component';
import { BlankService } from '../../generated/api/blank.service';
import { Response, ResponseContentType } from '@angular/http';
import {
  HttpClient, HttpHeaders, HttpParams,
  HttpResponse, HttpEvent
} from '@angular/common/http';
import { Observable } from 'rxjs/Observable';
import { Router, ActivatedRoute, Params } from '@angular/router';

@Component({
  selector: 'app-manage-users',
  templateUrl: './manage-users.component.html',
  styleUrls: ['./manage-users.component.css']
})
export class ManageUsersComponent implements OnInit {

  @ViewChild(HeaderComponent) header;

  id: number;
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
      (r: HttpResponse<RestResult>) => {
        var authHeader = r.headers.get('Authorization');
        this.jsonUser = atob(authHeader);
      }

    );
  }

}
