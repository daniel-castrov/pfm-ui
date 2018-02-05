import { Component, OnInit, ViewChild } from '@angular/core';
import { UserComponent } from '../user/user.component';
import { HeaderComponent } from '../../components/header/header.component';
import { User } from '../../generated/model/user';
import { NgForOf } from '@angular/common/src/directives';
import { AccordionModule } from 'primeng/accordion';


@Component({
  selector: 'app-manage-users',
  templateUrl: './manage-users.component.html',
  styleUrls: ['./manage-users.component.css']
})
export class ManageUsersComponent implements OnInit {

  @ViewChild(HeaderComponent) header;

  currentusername: string;
  currentUser: User;
  refcurrentUser: User;


  constructor() { }

  ngOnInit() {
  }

}
