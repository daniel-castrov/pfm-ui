import { Component, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ProgrammingModel } from '../../models/ProgrammingModel';
import { RequestSummaryNavigationHistoryService } from '../requests-summary/requests-summary-navigation-history.service';
import { ScheduleComponent } from './schedule/schedule.component';
import { TabDirective } from 'ngx-bootstrap';

@Component({
  selector: 'pfm-requests-details',
  templateUrl: './requests-details.component.html',
  styleUrls: ['./requests-details.component.scss']
})

export class RequestsDetailsComponent implements OnInit {

  @ViewChild('pfmSchedule', { static: false })
  pfmSchedule: ScheduleComponent;
  currentSelectedTab = 1;
  pomYear: number;

  constructor(
    public programmingModel: ProgrammingModel,
    private route: ActivatedRoute,
    private router: Router,
    private requestSummaryNavigationHistoryService: RequestSummaryNavigationHistoryService
  ) { }

  goBack(): void {
    this.requestSummaryNavigationHistoryService.prepareNavigationHistory();
    this.router.navigate(['/programming/requests']);
  }

  ngOnInit() {
    this.programmingModel.selectedProgramName = this.route.snapshot.paramMap.get('id');
    this.pomYear = Number(this.route.snapshot.paramMap.get('pomYear'));
  }

  onApprove(): void {
    console.log('Approve Organization');
  }

  onSave(): void {
    console.log('Approve Organization');
  }

  onReject(): void {
    console.log('Approve Organization');
  }

  onValidate(): void {
    console.log('Approve Organization');
  }

  onSelectTab(event: TabDirective) {
    switch (event.heading.toLowerCase()) {
      case 'program':
        this.currentSelectedTab = 0;
        break;
      case 'funds':
        this.currentSelectedTab = 1;
        break;
      case 'schedule':
        this.currentSelectedTab = 2;
        break;
      case 'scope':
        this.currentSelectedTab = 3;
        break;
      case 'assets':
        this.currentSelectedTab = 4;
        break;
      case 'justification':
        this.currentSelectedTab = 5;
        break;
    }
  }
}
