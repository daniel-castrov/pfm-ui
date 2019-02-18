import { Component, OnChanges, Input } from '@angular/core';
import { Budget, PB } from '../../../../generated';

@Component({
  selector: 'title-tab',
  templateUrl: './title-tab.component.html',
  styleUrls: ['./title-tab.component.scss']
})
export class TitleTabComponent implements OnChanges {

  @Input() scenario: PB;
  @Input() budget: Budget;
  @Input() editable: boolean;

  constructor() { }

  ngOnChanges() {
  } 

}
