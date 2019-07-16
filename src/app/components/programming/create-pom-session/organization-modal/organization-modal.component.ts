import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-organization-modal',
  templateUrl: './organization-modal.component.html',
  styleUrls: ['./organization-modal.component.scss']
})
export class OrganizationModalComponent implements OnInit {
  suborgdata: any;

  constructor(
  ) { }

  ngOnInit() {
  }
  
  onSuborgData(x) {
    this.suborgdata = x;
    console.log('data1', this.suborgdata);
  }
}
