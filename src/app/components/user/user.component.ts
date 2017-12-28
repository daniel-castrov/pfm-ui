import { Component, OnInit, Input } from '@angular/core';
import { Response, ResponseContentType } from '@angular/http';
import { Router, ActivatedRoute, Params } from '@angular/router';

import { BlankService } from '../../generated/api/blank.service';
import { Communication } from '../../generated/model/communication';
import { PexUser } from '../../generated/model/pexUser';
import { RestResult } from '../../generated/model/restResult';
import { UserDetailsService } from '../../generated/api/userDetails.service';

import {
  HttpClient, HttpHeaders, HttpParams,
  HttpResponse, HttpEvent
} from '@angular/common/http';

import { Observable } from 'rxjs/Observable';

@Component({
  selector: 'app-user',
  templateUrl: './user.component.html',
  styleUrls: ['./user.component.css']
})
export class UserComponent implements OnInit {
  //@Input() public title: string;
  //@Input() public isUserLoggedIn: boolean;
  //@Input() public currentusername: string;

  currentusername: string;
  currentUser: PexUser;
  refcurrentUser: PexUser;

  //pexUser: PexUser;
  //communications:Communication[]=[];
  //refcommunications:Communication[]=[];

  isdEditMode: boolean = false;

  communicationsType = {
    phone: '',
    email: ''
  }

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private userDetailsService: UserDetailsService,
    private blankService: BlankService,
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
      this.refcurrentUser = JSON.parse(JSON.stringify(this.currentUser));
    });
    
  }

  editMode():void{
    this.isdEditMode=true;
  }

  cancelEdit():void{
    this.currentUser = JSON.parse(JSON.stringify(this.refcurrentUser));
    this.isdEditMode=false;
  }

  addCommunication():void{
    let newCom:Communication;
    newCom = new Object;
    newCom.type = "EMAIL";
    newCom.confirmed = false;
    newCom.preferred = false;
    newCom.subtype = "SECONDARY";
    newCom.value = "";
    this.currentUser.communications.push(newCom);
  }

  saveCommunications():void{
    for (let comm  of this.currentUser.communications ){
      console.log(comm.type + comm.subtype + comm.value + comm.confirmed + comm.preferred);
    }

    console.log(JSON.stringify(this.currentUser));


    for(var i = this.currentUser.communications.length - 1; i >= 0; i--) {
      if(this.currentUser.communications[i].value === "") {
        this.currentUser.communications.splice(i, 1);
      }
    }


    let result:RestResult;
    this.userDetailsService.updateCurrentUser(this.currentUser)
    .subscribe(r => {
      result=r;
    });

    this.isdEditMode=false;
  }

}
