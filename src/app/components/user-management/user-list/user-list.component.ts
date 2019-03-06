import {Component, OnInit} from '@angular/core';
import {ActivatedRoute, Router} from '@angular/router';
import {User} from '../../../generated/model/user';
import {RestResult} from '../../../generated/model/restResult';
import {UserService} from '../../../generated/api/user.service';


@Component({
  selector: 'app-user-list',
  templateUrl: './user-list.component.html',
  styleUrls: ['./user-list.component.css']
})
export class UserListComponent implements OnInit {

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

