import { Component, OnInit, ViewChild, HostListener, Input } from '@angular/core';
import { GoogleChartComponent } from 'ng2-google-charts';
import { GoogleChartInterface } from 'ng2-google-charts/google-charts-interfaces';
import { PomService } from '../../../services/pom-service';

@Component({
  selector: 'pfm-justification',
  templateUrl: './justification.component.html',
  styleUrls: ['./justification.component.scss']
})
export class JustificationComponent implements OnInit {

  @ViewChild('googleChart', { static: false })
  chart: GoogleChartComponent;

  @Input() pomYear: number;

  chartData: GoogleChartInterface = {
    chartType: 'ColumnChart',
    options: {
      titlePosition: 'none',
      width: 800,
      height: 350,
      series: {
        0: {
          type: 'line'
        },
        1: {
          type: 'line'
        },
        2: {
          type: 'line',
          color: '#000',
          visibleInLegend: false,
          lineWidth: 0,
          enableInteractivity: false
        }
      },
      vAxis: {
        format: '$#,###',
        gridlines: {
          count: 10
        },
      },
      animation: {
        duration: 500,
        easing: 'out',
        startup: true
      },
    }
  };

  boundData = [
    92000,
    92000,
    92000,
    60000,
    60000
  ];

  mockDataPreviousYear = [
    80000,
    87000,
    90000,
    77000,
    75000
  ];

  mockDataCurrentYear = [
    84000,
    86000,
    85000,
    80000,
    73000
  ];

  constructor(
    private pomService: PomService
  ) { }

  ngOnInit() {
    this.loadPom();
    this.drawLineChart();
  }

  @HostListener('window:resize', ['$event'])
  onWindowResize(event: any) {
    if (this.chart) {
      this.chart.draw();
    }
  }

  onChartReady(event: any) {
  }

  drawLineChart(redraw?: boolean) {
    const data: any[] = [
      [
        'Fiscal Year',
        'POM' + (this.pomYear % 100 - 1),
        'POM' + (this.pomYear % 100),
        ''
      ]
    ];
    for (let i = 0; i < 5; i++) {
      data.push([
        'FY' + (this.pomYear % 100 + i),
        this.mockDataPreviousYear[i],
        this.mockDataCurrentYear[i],
        this.boundData[i]
      ]);
    }
    this.chartData.dataTable = data;
    if (this.chart) {
      this.chart.draw();
    }
  }

  loadPom() {
    this.pomService.getPomForYear(this.pomYear).subscribe(x => {

    });
  }

}
