import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'lib-budget-core',
  template: `
    <p>
      everything in budget-core is available for to the Budget(s) Plugin
    </p>
  `,
  styles: []
})
export class BudgetCoreComponent implements OnInit {

  constructor() { }

  ngOnInit() {
  }

}
