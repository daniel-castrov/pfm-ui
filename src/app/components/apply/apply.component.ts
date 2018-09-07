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

    $( ".basic" ).click(function() {
      $.notify({
        // options
        title: "",
        message: "<strong>Your application to join JSCBIS has been submitted. Please check your email for the status of your request.</strong>",
        icon: 'fa fa-check',
        url: "./about",
        target: "_self",
        // settings
      	element: 'div.aplly-form',
      	position: null,
      	type: 'success',
      	allow_dismiss: true,
      	newest_on_top: false,
      	showProgressbar: true,
      	placement: {
      		from: "bottom",
      		align: "left"
      	},
        offset: {
      		x: 50,
      		y: 100
      	},
      	spacing: 10,
      	z_index: 1031,
      	delay: 5000,
      	timer: 0,
      	url_target: '_self',
      	mouse_over: null,
      	animate: {
      		enter: 'animated fadeInDown',
      		exit: 'animated fadeOutUp'
      	},
      	onShow: null,
      	onShown: null,
      	onClose: null,
      	onClosed: null,
      	icon_type: 'class',

        // custom template
        template: '<div data-notify="container" class="col-xs-11 col-sm-3 alert alert-{0}" role="alert">' +
      		'<button type="button" aria-hidden="true" class="close" data-notify="dismiss">×</button>' +
      		'<span data-notify="icon"></span> ' +
      		'<span data-notify="title">{1}</span> ' +
      		'<span data-notify="message">{2}</span>' +
      		'<div class="progress" data-notify="progressbar">' +
      			'<div class="progress-bar progress-bar-{0}" role="progressbar" aria-valuenow="0" aria-valuemin="0" aria-valuemax="100" style="width: 0%;"></div>' +
      		'</div>' +
      		'<a href="{3}" target="{4}" data-notify="url"></a>' +
          '<button class="btn btn-success" (click)="done()">OK</button>' +
      	'</div>'
      });
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
