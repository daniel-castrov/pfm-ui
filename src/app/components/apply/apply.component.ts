import { Component, OnInit } from '@angular/core';
import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';

// Generated
import { Community } from '../../generated';
import { CommunityService } from '../../generated';
import { CreateUserRequest } from '../../generated/model/createUserRequest';
import { CreateUserRequestService } from '../../generated/api/createUserRequest.service';
import { RestResult } from '../../generated/model/restResult';
import { Stranger } from '../../generated/model/stranger';
import { StrangerService } from '../../generated/api/stranger.service';

@Component({
  selector: 'app-apply',
  templateUrl: './apply.component.html',
  styleUrls: ['./apply.component.css']
})
export class ApplyComponent implements OnInit {

  id: any;
  name: any;
  ch1: boolean = false;
  resultError: string[]=[];
  stranger:Stranger;
  communities:Community[]=[];
  createUserRequest:CreateUserRequest=new Object();



  constructor(
    public communityService: CommunityService,
    public createUserRequestService: CreateUserRequestService,
    public strangerService:StrangerService

  ) {

    this.id,
    this.name
  }
  ngOnInit() {
    this.getStranger();
  }

  getStranger():void {
    let resultStranger:RestResult;

    let s = this.strangerService.get();
    s.subscribe(c => {
      resultStranger = c;
      this.resultError.push(resultStranger.error);
      this.stranger= resultStranger.result;
      console.log( this.stranger.cn );
      this.communities = this.stranger.communities;
      this.setUser(this.stranger);
    });
  }

  setUser(x){
    this.createUserRequest.cn= x.cn;
      this.createUserRequest.nda='v1';
      this.createUserRequest.firstName="'MI'";
      this.createUserRequest.middleInitial= 'C';
      this.createUserRequest.lastName= 'Gi';
      this.createUserRequest.titleRank= 'df';
      this.createUserRequest.dutyJob= 'df';
      this.createUserRequest.contactEmail= 'joe@abc.com';
      this.createUserRequest.phone= '1231231234';
      this.createUserRequest.city= 'frfr';
      this.createUserRequest.organization= 'frfr';
      this.createUserRequest.sponsorName= 'frfr';
      this.createUserRequest.sponsorEmail= 'joe@abc.com';
      this.createUserRequest.sponsorPhone= '1231231234';
      console.log( this.stranger.cn );


      if ( x.contractor ){
        console.log("Contractor");
      } else {
        console.log("No Contractor");
      }

  }

  getRequest(): void {

    let resultReq:RestResult;

    this.createUserRequestService.create

  }


  branches = [
    { id: 1, name: 'Army (USA)' },
    { id: 2, name: 'USAF (Air Force)' },
    { id: 3, name: 'USN (Navy)' },
    { id: 4, name: 'USMC (Marine Corps)' },
    { id: 5, name: 'USCG (Coast Guard)' },
    { id: 6, name: 'Other' },
    { id: 7, name: 'None' }
  ];

  submitted = false;

  onSubmit({ value, valid }) {
    if (valid) {
      console.log(value);
      this.submitted = true;
      this.ch1 = true;
      this.postNewRequest();
    } else {
      // console.log('Form is invalid');
    }
  }

  postNewRequest(){

    this.createUserRequest.state="'UNDECIDED'";

    let resultReq:RestResult;
    let s=this.createUserRequestService.create(this.createUserRequest);
    s.subscribe(c => {
      resultReq = c;
      this.resultError.push(resultReq.error);
      this.stranger= resultReq.result;
      console.log( this.stranger.cn );
      this.communities = this.stranger.communities;
      this.setUser(this.stranger);
    });
  }

  

  submit(applyForm) {
    applyForm.value
    console.log(this.createUserRequest);
  }

}
