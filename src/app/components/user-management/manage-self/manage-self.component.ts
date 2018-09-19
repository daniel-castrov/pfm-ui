import { Component, OnInit, Input, ViewChild  } from '@angular/core';
import { Response, ResponseContentType } from '@angular/http';
import { Router, ActivatedRoute, Params } from '@angular/router';
import {
  HttpClient, HttpHeaders, HttpParams,
  HttpResponse, HttpEvent
} from '@angular/common/http';
import { Observable } from 'rxjs/Observable';

// Other Components
import { HeaderComponent } from '../../header/header.component';

// Generated
import { Communication } from '../../../generated/model/communication';
import { User } from '../../../generated/model/user';
import { RestResult } from '../../../generated/model/restResult';
import { MyDetailsService } from '../../../generated/api/myDetails.service';

@Component({
  selector: 'app-manage-self',
  templateUrl: './manage-self.component.html',
  styleUrls: ['./manage-self.component.scss']
})
export class ManageSelfComponent implements OnInit {

  @ViewChild(HeaderComponent) header;

  currentusername: string;
  currentUser: User;
  refcurrentUser: User;
  isdEditMode: boolean = false;

  communicationsType = {
    phone: '',
    email: ''
  }

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private userDetailsService: MyDetailsService,
  ) {
    this.route.params.subscribe((params: Params) => {
      this.currentusername = params.id;
    });
  }

  ngOnInit() {
    this.getCurrentUser();
    var my:ManageSelfComponent = this;
  }

  getCurrentUser():void {
    var result:RestResult;
    this.userDetailsService.getCurrentUser()
    .subscribe((c) => {
      result = c;
      this.currentUser = result.result;
      // Make a copy of the current user so we can revert changes
      this.refcurrentUser = JSON.parse(JSON.stringify(this.currentUser));
    });
  }

  saveCurrentUser():void{
    let result:RestResult;
    var my:ManageSelfComponent = this;
    this.userDetailsService.updateCurrentUser(this.currentUser)
    .subscribe(r => {
      result=r;
    });

    this.isdEditMode=false;
  }

  // toggle edit mode
  editMode():void{
    this.isdEditMode=true;
  }

  cancelEdit():void{
    // revert changes
    this.currentUser = JSON.parse(JSON.stringify(this.refcurrentUser));
    this.isdEditMode=false;
  }

  createNewCommunication():void{
    let newCom:Communication;

    newCom = new Object;
    newCom.primaryEmail

  }

}
