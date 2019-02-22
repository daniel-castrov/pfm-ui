import { Component, OnChanges, Input } from '@angular/core';
import { Budget, PB } from '../../../../generated';

@Component({
  selector: 'overview-tab',
  templateUrl: './overview-tab.component.html',
  styleUrls: ['./overview-tab.component.scss']
})
export class OverviewTabComponent implements OnChanges {

  @Input() scenario: PB;
  @Input() budget: Budget;
  @Input() editable: boolean;

  constructor() { }

  ngOnChanges() {
  }

}
