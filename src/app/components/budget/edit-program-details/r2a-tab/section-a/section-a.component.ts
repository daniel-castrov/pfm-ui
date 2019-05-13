import {Component, Input} from '@angular/core';
import {R2AProgramData} from '../../../../../generated';

@Component({
  selector: 'section-a',
  templateUrl: './section-a.component.html',
  styleUrls: ['./section-a.component.scss']
})
export class SectionAComponent {

  @Input() r2AData: R2AProgramData;

  constructor() {}

}
