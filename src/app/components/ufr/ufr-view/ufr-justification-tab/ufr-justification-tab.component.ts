import { Component, OnInit, Input } from '@angular/core';
import {UFR, UfrStatus} from '../../../../generated';
import {Validation} from "../../../programming/program-request/funds-tab/Validation";

@Component({
  selector: 'ufr-justification-tab',
  templateUrl: './ufr-justification-tab.component.html',
  styleUrls: ['./ufr-justification-tab.component.scss']
})
export class UfrJustificationComponent implements OnInit {
  @Input() ufr: UFR;
  @Input() editable: boolean = false;
  @Input() readonly: boolean;

  constructor() { }

  ngOnInit() {
  }

  get validate(): Validation {
    if(!this.ufr.justification || !this.ufr.impactN || !this.ufr.milestoneImpact) {
      return new Validation(false, 'You must fill all the required fields from the justification tab');
    }
  }
}
