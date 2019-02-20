import { Component, OnChanges, Input } from '@angular/core';
import { Budget, PB } from '../../../../generated';

@Component({
  selector: 'r2a-tab',
  templateUrl: './r2a-tab.component.html',
  styleUrls: ['../edit-budget-scenario.component.scss']
})
export class R2aTabComponent implements OnChanges {

  @Input() scenario: PB;
  @Input() budget: Budget;
  @Input() editable: boolean;

  constructor() { }

  ngOnChanges() {
  }

}
