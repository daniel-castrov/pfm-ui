import { Component, OnInit, Input } from '@angular/core';
import { Response, ResponseContentType } from '@angular/http';
import { Router, ActivatedRoute, Params } from '@angular/router';
import {
  HttpClient, HttpHeaders, HttpParams,
  HttpResponse, HttpEvent
} from '@angular/common/http';
import { Observable } from 'rxjs/Observable';

import { Communication } from '../../generated/model/communication';
import { PexUser } from '../../generated/model/pexUser';
import { RestResult } from '../../generated/model/restResult';
import { UserDetailsService } from '../../generated/api/userDetails.service';

@Component({
  selector: 'app-user',
  templateUrl: './user.component.html',
  styleUrls: ['./user.component.css']
})
export class UserComponent implements OnInit {

  currentusername: string;
  currentUser: PexUser;
  refcurrentUser: PexUser;

  isdEditMode: boolean = false;

  communicationsType = {
    phone: '',
    email: ''
  }

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private userDetailsService: UserDetailsService,
  ) {
    this.route.params.subscribe((params: Params) => {
      this.currentusername = params.id;
    });
  }

  ngOnInit() {
    this.getCurrentUser();      
  }

  getCurrentUser(){
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
    
    // clean up empty communications
    for(var i = this.currentUser.communications.length - 1; i >= 0; i--) {
      if(this.currentUser.communications[i].value === "") {
        this.currentUser.communications.splice(i, 1);
      }
    }

    // FIX ME
    this.currentUser.authorities=[];
    console.log(JSON.stringify(this.currentUser));

    let result:RestResult;
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
    newCom.type = "EMAIL";
    newCom.confirmed = false;
    newCom.preferred = false;
    newCom.subtype = "SECONDARY";
    newCom.value = "";
    this.currentUser.communications.push(newCom);
  }

}
