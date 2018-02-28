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

  // id: any;
  // name: any;
  ch1: boolean = false;
  resultError: string[]=[];
  stranger:Stranger;
  communities:Community[]=[];
  createUserRequest:CreateUserRequest;



  constructor(
    public communityService: CommunityService,
    public createUserRequestService: CreateUserRequestService,
    public strangerService:StrangerService

  ) { 
    
    

    // this.id, 
    // this.name
  }


  ngOnInit() {
    this.getStranger();
    this.getCommunities();

    if ( this.stranger.contractor ){
      console.log("Contractor");
    } else {
      console.log("No Contractor");
    }

    this.createUserRequest.cn= this.stranger.cn;
    this.createUserRequest.nda='v1';
    this.createUserRequest.firstName='';
    this.createUserRequest.middleInitial= '';
    this.createUserRequest.lastName= '';
    this.createUserRequest.titleRank= '';
    this.createUserRequest.dutyJob= '';
    this.createUserRequest.contactEmail= '';
    this.createUserRequest.phone= '';
    this.createUserRequest.city= '';
    this.createUserRequest.organization= '';
    this.createUserRequest.sponsorName= '';
    this.createUserRequest.sponsorEmail= '';
    this.createUserRequest.sponsorPhone= '';


  }

  getStranger():void {
    let resultStranger:RestResult;

    let s = this.strangerService.get();
    s.subscribe(c => {
      resultStranger = c;
      this.resultError.push(resultStranger.error);
      this.stranger= resultStranger.result;

      console.log( this.stranger.cn );

    });
  }

  getCommunities(): void{
    let result: RestResult;
    this.communityService.getAll()
      .subscribe(c => {
        result = c;
        this.resultError.push(result.error);
        this.communities = result.result;
      });
  }

  getRequest(): void {

    let resultReq:RestResult;

    this.createUserRequestService.create

  }


  apply = {
    firstname: '',
    middle: '',
    lastname: '',
    rank: '',
    job: '',
    email: '',
    phone: '',
    address: '',
    organization: '',
    sponsorname: '',
    sponsoremail: '',
    sponsorphone: ''
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
    } else {
      // console.log('Form is invalid');
    }
  }

  submit(applyForm) {
    applyForm.value
  }



}
