import { Component, OnChanges, Input } from '@angular/core';
import { Budget, PB, RdteData } from '../../../../generated';

@Component({
  selector: 'r2-tab',
  templateUrl: './r2-tab.component.html',
  styleUrls: ['../edit-budget-details.component.scss']
})
export class R2TabComponent implements OnChanges {

  @Input() scenario: PB;
  @Input() budget: Budget;
  @Input() editable: boolean;
  @Input() rdteData: RdteData;

  constructor() { }

  ngOnChanges() {
  }

}
