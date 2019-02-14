import { Component, OnChanges, Input } from '@angular/core';
import { Budget, PB } from '../../../../generated';

@Component({
  selector: 'r1-tab',
  templateUrl: './r1-tab.component.html',
  styleUrls: ['./r1-tab.component.scss']
})
export class R1TabComponent implements OnChanges {

  @Input() scenario: PB;
  @Input() budget: Budget;
  @Input() editable: boolean;

  constructor() { }

  ngOnChanges() {
  }

}
