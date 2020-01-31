import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'pfm-schedule',
  templateUrl: './schedule.component.html',
  styleUrls: ['./schedule.component.scss']
})
export class ScheduleComponent implements OnInit {

  chartData:any = {
    chartType: 'Gantt',
    options: {
      width: 1500,
      height: 800
    }
  };

  constructor() { }

  ngOnInit() {

    var data = [];
    data[0] = [];
    data[0].push('Task ID');
    data[0].push('Task Name');
    data[0].push('Start Date');
    data[0].push('End Date');
    data[0].push('Duration');
    data[0].push('Percent Complete');
    data[0].push('Dependencies');

    data.push(['Research', 'Find sources', new Date(2015, 0, 1), new Date(2015, 0, 5), null,  100,  null]);
    data.push(['Write', 'Write paper',null, new Date(2015, 0, 9), this.daysToMilliseconds(3), 25, 'Research,Outline']);
    data.push(['Cite', 'Create bibliography',null, new Date(2015, 0, 7), this.daysToMilliseconds(1), 20, 'Research']);
    data.push(['Complete', 'Hand in paper',null, new Date(2015, 0, 10), this.daysToMilliseconds(1), 0, 'Cite,Write']);
    data.push(['Outline', 'Outline paper',null, new Date(2015, 0, 6), this.daysToMilliseconds(1), 100, 'Research']);
    this.chartData.dataTable = data;
  }

  daysToMilliseconds(days) {
    return days * 24 * 60 * 60 * 1000;
  }
}
