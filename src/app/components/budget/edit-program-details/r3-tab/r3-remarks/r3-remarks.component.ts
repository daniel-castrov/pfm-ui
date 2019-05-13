import {Component, Input} from '@angular/core';
import {R3Data} from "../../../../../generated";

@Component({
  selector: 'r3-remarks',
  templateUrl: './r3-remarks.component.html',
  styleUrls: ['./r3-remarks.component.scss']
})
export class R3RemarksComponent {

  @Input() r3Data: R3Data;

  constructor() { }

}
