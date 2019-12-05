import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-demo-widget-pom-phase-funding',
  templateUrl: './demo-widget-pom-phase-funding.component.html',
  styleUrls: ['./demo-widget-pom-phase-funding.component.scss']
})
export class DemoWidgetPOMPhaseFundingComponent implements OnInit {

  public barChart = {
    chartType: 'Bar',
    dataTable: [
      ['Year', 'Sales', 'Expenses', 'Profit'],
      ['2014', 1000, 400, 200],
      ['2015', 1170, 460, 250],
      ['2016', 660, 1120, 300],
      ['2017', 1030, 540, 350]
    ],
    options: {
      chart: {
        title: 'Company Performance',
        subtitle: 'Sales, Expenses, and Profit: 2014-2017'
      }
    }
  };


  constructor() { }

  ngOnInit() {
  }

}
