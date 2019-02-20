import {Component, ViewChild} from '@angular/core';
import {HeaderComponent} from '../../header/header.component';

@Component({
  selector: 'copy-budget',
  templateUrl: './copy-budget.component.html',
  styleUrls: ['./copy-budget.component.scss']
})
export class CopyBudgetComponent  {

  @ViewChild(HeaderComponent) header;

  items: any[] = [];

  constructor() {}


}
