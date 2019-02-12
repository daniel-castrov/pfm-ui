import {Component, ViewChild} from '@angular/core';
import {HeaderComponent} from '../../header/header.component';

@Component({
  selector: 'budget-scenarios',
  templateUrl: './budget-scenarios.component.html',
  styleUrls: ['./budget-scenarios.component.scss']
})
export class BudgetScenariosComponent  {

  @ViewChild(HeaderComponent) header;

  items: any[] = [];

  constructor() {}


}
