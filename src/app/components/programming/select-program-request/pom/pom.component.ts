import { Component, Input } from '@angular/core';
import { Pom } from '../../../../generated/model/pom';

@Component({
  selector: 'j-pom',
  templateUrl: './pom.component.html',
  styleUrls: ['./pom.component.scss']
})
export class PomComponent {
  
  @Input() private pom: Pom;

  constructor() {}

}
