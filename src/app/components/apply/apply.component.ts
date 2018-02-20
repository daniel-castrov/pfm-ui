import { Component, OnInit } from '@angular/core';
import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';

@Component({
  selector: 'app-apply',
  templateUrl: './apply.component.html',
  styleUrls: ['./apply.component.css']
})
export class ApplyComponent implements OnInit {

  id: any;
  name: any;
  ch1: boolean;

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

  constructor() { this.id, this.name }

  branches = [
    { id: 1, name: 'Army (USA)' },
    { id: 2, name: 'USAF (Air Force)' },
    { id: 3, name: 'USN (Navy)' },
    { id: 4, name: 'USMC (Marine Corps)' },
    { id: 5, name: 'USCG (Coast Guard)' },
    { id: 6, name: 'Other' },
    { id: 7, name: 'None' }
  ];

  // getBranches(): any[] {
  //
  //  let branches = [
  //    { id: 1, name: 'Army (USA)' },
  //    { id: 2, name: 'USAF (Air Force)' },
  //    { id: 3, name: 'USN (Navy)' },
  //    { id: 4, name: 'USMC (Marine Corps)' },
  //    { id: 5, name: 'USCG (Coast Guard)' },
  //    { id: 6, name: 'Other' },
  //    { id: 7, name: 'None)' }
  //  ];
  //  return branches;
  // }

  communities = [
    { id: 1, name: 'JPEO-CBO' },
    { id: 2, name: 'JSTO-CBD' },
    { id: 3, name: 'JSTO-CBD' },
    { id: 4, name: 'TRAC-CWMD' },
    { id: 5, name: 'TRAC-CDP' },
    { id: 6, name: 'TRAC-CDP' },
    { id: 7, name: 'NM)' },
    { id: 8, name: 'DTRA' }
  ];

  submitted = false;

  onSubmit({ value, valid }) {
    if (valid) {
      console.log(value);
    } else {
      // console.log('Form is invalid');
    }
    this.submitted = true;
  }

  submit(applyForm) {
    applyForm.value
  }


  ngOnInit() {
  }

}
