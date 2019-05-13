import {Component, Input} from '@angular/core';
import {R2AProgramData} from '../../../../../generated';

@Component({
  selector: 'section-e',
  templateUrl: './section-e.component.html',
  styleUrls: ['./section-e.component.scss']
})
export class SectionEComponent {

  @Input() r2AData: R2AProgramData;

  constructor() {}

}
