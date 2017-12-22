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

  currentusername: number;
  pexUser: PexUser;
  communications:Communication[]=[];


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

  getCurrentUser() {
    let resp = this.blankService.blank("response", true);
    resp.subscribe(
      (r: HttpResponse<RestResult>) => {
        var authHeader = r.headers.get('Authorization');
        this.pexUser = JSON.parse(atob(authHeader));

        let comm:Communication;
        for (comm  of this.pexUser.communications ){
          console.log(comm.value);
          this.communications.push(comm);
        }


      },error => {
      }
    );
  }


  editMode():void{
    this.isdEditMode=true;
  }

  cancelEdit():void{
    this.communications = this.pexUser.communications ;
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
    this.communications.push(newCom);
  }

  saveCommunications():void{
    for (let comm  of this.communications ){
      console.log(comm.type + comm.subtype + comm.value + comm.confirmed + comm.preferred);
    }

    let result:RestResult;
    this.userDetailsService.updateMyCommunications(this.communications)
    .subscribe(r => {
      result=r;
    });

  }

}
