import {Component, Input} from '@angular/core';
import {R2AProgramData} from '../../../../../generated';

@Component({
  selector: 'section-d',
  templateUrl: './section-d.component.html',
  styleUrls: ['./section-d.component.scss']
})
export class SectionDComponent {

  @Input() r2AData: R2AProgramData;

  constructor() {}

}
