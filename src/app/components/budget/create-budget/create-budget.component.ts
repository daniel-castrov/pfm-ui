import {Component, ViewChild} from '@angular/core';
import {HeaderComponent} from '../../header/header.component';

@Component({
  selector: 'create-budget',
  templateUrl: './create-budget.component.html',
  styleUrls: ['./create-budget.component.scss']
})
export class CreateBudgetComponent  {

  @ViewChild(HeaderComponent) header;

  items: any[] = [];

  constructor() {}


}
