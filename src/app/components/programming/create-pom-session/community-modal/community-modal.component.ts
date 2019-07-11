import { Component, OnInit } from '@angular/core';
import {NgbModal, NgbActiveModal} from '@ng-bootstrap/ng-bootstrap';
@Component({
  selector: 'app-community-modal',
  templateUrl: './community-modal.component.html',
  styleUrls: ['./community-modal.component.scss']
})
export class CommunityModalComponent implements OnInit {
  private toayear: number;
  ValueFromComponent1:any;
  constructor(
    public activeModal: NgbActiveModal
  ) {}

  ngOnInit() {
  }
  receiveUpdatedData(var1:any)
  {
      this.ValueFromComponent1=var1;
      console.log('value data', this.ValueFromComponent1);
  }

}
