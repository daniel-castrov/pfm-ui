import { Component, OnInit, ViewChild } from '@angular/core';
import { Response, ResponseContentType } from '@angular/http';
import {
  HttpClient, HttpHeaders, HttpParams,
  HttpResponse, HttpEvent
} from '@angular/common/http';
import { Observable } from 'rxjs/Observable';
import { Router, ActivatedRoute, Params } from '@angular/router';

// Other Components
import { JHeaderComponent } from '../../header/j-header/j-header.component';

// Generated
import { User } from '../../../generated/model/user';
import { RestResult } from '../../../generated/model/restResult';
import { UserService } from '../../../generated/api/user.service';


@Component({
  selector: 'app-user-list',
  templateUrl: './user-list.component.html',
  styleUrls: ['./user-list.component.css']
})
export class UserListComponent implements OnInit {

  @ViewChild(JHeaderComponent) header;


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
    this.userService.getAll()
    .subscribe(c => {
      result = c;
      this.resultError = result.error;
      this.users=result.result;
    });
  }

}

