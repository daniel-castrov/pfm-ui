import { ChangeDetectorRef, Component, OnInit } from '@angular/core';

@Component({
  selector: 'pfm-dashboard-widget-one',
  templateUrl: './demo-widget-one.component.html',
  styleUrls: ['./demo-widget-one.component.scss']
})
export class DemoWidgetOneComponent implements OnInit {

  public pieChart;

  ngOnInit(): void {

    this.pieChart = {
      chartType: 'PieChart',
      dataTable: [
        ['Item', 'Percent'],
        ['One',     11],
        ['Two',      2],
        ['Three',  2],
        ['Four', 2],
        ['Five',    7]
      ],
      options: {
        title: 'Tasks',
        height: 'auto',
        width: 'auto',
        slices: {
          0: {offset: 0.3},
          1: {offset: 0.2}
        }
      }
    };

  }

}
