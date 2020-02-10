import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ProgrammingModel } from '../../models/ProgrammingModel';
import { RequestSummaryNavigationHistoryService } from '../requests-summary/requests-summary-navigation-history.service';

@Component({
  selector: 'pfm-requests-details',
  templateUrl: './requests-details.component.html',
  styleUrls: ['./requests-details.component.scss']
})

export class RequestsDetailsComponent implements OnInit {

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
    this.programmingModel.selectedProgramName = this.route.snapshot.paramMap.get("id");
  }

  onApprove(): void  {
    console.log('Approve Organization');
  }

  onSave(): void  {
    console.log('Approve Organization');
  }

  onReject(): void  {
    console.log('Approve Organization');
  }

  onValidate(): void  {
    console.log('Approve Organization');
  }
}
