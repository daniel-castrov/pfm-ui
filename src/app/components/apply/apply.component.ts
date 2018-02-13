import { Component, OnInit } from '@angular/core';
import { BsModalService } from 'ngx-bootstrap';
import { BsModalRef } from 'ngx-bootstrap';

@Component({
  selector: 'app-apply',
  templateUrl: './apply.component.html',
  styleUrls: ['./apply.component.css']
})
export class ApplyComponent implements OnInit {

    apply = {
      firstname:'',
      middlename:'',
      lastname:'',
      rank:'',
      job:'',
      email:'',
      phone:'',
      address:'',
      organization:'',
      orgrequest:'',
      branch:'',
      sponsorname:'',
      sponsoremail:'',
      sponsorphone:''
  }

  onSubmit({value, valid}){
   if(valid){
       console.log(value);
   } else {
       console.log('Form is invalid');
   }
  }

    constructor() { }

    ngOnInit() {
    }

  }
