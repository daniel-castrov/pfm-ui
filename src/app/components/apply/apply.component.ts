import { Component, OnInit } from '@angular/core';
import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';
import { Router } from '@angular/router';

// Generated
import { Community } from '../../generated';
import { CommunityService } from '../../generated';
import { CreateUserRequest } from '../../generated/model/createUserRequest';
import { CreateUserRequestService } from '../../generated/api/createUserRequest.service';
import { RestResult } from '../../generated/model/restResult';
import { Stranger } from '../../generated/model/stranger';
import { StrangerService } from '../../generated/api/stranger.service';

declare var jquery: any;
declare var $: any;

@Component({
  selector: 'app-apply',
  templateUrl: './apply.component.html',
  styleUrls: ['./apply.component.scss']
})
export class ApplyComponent implements OnInit {

  resultError: string[] = [];
  stranger: Stranger;
  communities: Community[] = [];
  ndaSatisfied: boolean;
  ndaText:string;
  createUserRequest: CreateUserRequest = new Object();
  formsubmitted: boolean;

  constructor(
    public communityService: CommunityService,
    public createUserRequestService: CreateUserRequestService,
    public strangerService: StrangerService,
    private router: Router,
  ) { }

  ngOnInit() {
    this.formsubmitted = false;
    this.ndaSatisfied = true;
    this.getStranger();

    $.notify({
    	// options
      icon: 'fa fa-check',
      // icon: 'fa fa-exclamation-triangle',
      // icon: 'fa fa-info-circle',
      // icon: 'fa fa-exclamation',
      // icon: 'fa fa-comment',
    	message: 'Your application to join JSCBIS has been submitted. Please check your email for the status of your request. '
    },{
    	// settings
    	type: 'success',
      timer: 0,
      animate: {
    		enter: 'animated fadeInRight',
    		exit: 'animated fadeOutRight'
    	}
    });
  }

  getStranger(): void {
    let resultStranger: RestResult;

    let s = this.strangerService.get();
    s.subscribe(c => {
      resultStranger = c;
      this.resultError.push(resultStranger.error);
      this.stranger = resultStranger.result;


      if ( this.stranger.contractor ){
        this.ndaSatisfied = false;
      }
      this.communities = this.stranger.communities;
      this.ndaText = this.stranger.nda;
    });
  }

  onSubmit({ value, valid }) {
    if (valid) {

      this.createUserRequest = value;
      this.createUserRequest.status = "UNDECIDED";
      this.createUserRequest.cn = this.stranger.cn;

      if ( this.stranger.contractor ){
        this.createUserRequest.nda = this.ndaText.substring(0,this.ndaText.indexOf("\n"));
      } else {
        this.createUserRequest.nda="NA"
      }

      console.log(this.createUserRequest);

      let resultReq: RestResult;
      let s = this.createUserRequestService.create(this.createUserRequest);
      s.subscribe(c => {
        resultReq = c;
      });

      this.formsubmitted = true;

    } else {
      this.resultError.push("Unable to submit New User Request Form");
      console.log("Unable to submit New User Request Form");
    }
  }

  done(){
    this.router.navigate(['./about']);
  }

  services = [
    { id: 1, name: 'Army (USA)' },
    { id: 2, name: 'USAF (Air Force)' },
    { id: 3, name: 'USN (Navy)' },
    { id: 4, name: 'USMC (Marine Corps)' },
    { id: 5, name: 'USCG (Coast Guard)' },
    { id: 6, name: 'Other' },
    { id: 7, name: 'None' }
  ];

}
