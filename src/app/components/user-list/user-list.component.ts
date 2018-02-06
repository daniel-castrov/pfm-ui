import { Component, OnInit, ViewChild } from '@angular/core';
import { UserComponent } from '../user/user.component';
import { User } from '../../generated/model/user';
import { RestResult } from '../../generated/model/restResult';
import { Communication } from '../../generated/model/communication';
import { GrantedAuthority } from '../../generated/model/grantedAuthority';
import { CommunityService, Community, UserService } from '../../generated';
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
  selector: 'app-user-list',
  templateUrl: './user-list.component.html',
  styleUrls: ['./user-list.component.css']
})
export class UserListComponent implements OnInit {

  @ViewChild(HeaderComponent) header;


  users: User[]=[];
  resultError: string;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    public userService: UserService,
  ) {
  }

  ngOnInit() {
    this.getUsers();
  }

  getUsers(): void{
    let result:RestResult;
    this.userService.getAllUsers()
    .subscribe(c => {
      result = c;
      this.resultError = result.error;
      this.users=result.result;


      let user:User;
      for ( user of this.users ){
        console.log(user);
      }
      

    });
  }

}

