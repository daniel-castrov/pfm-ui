import { Component, ViewChild, OnInit } from '@angular/core';
import { Request } from '../../../services/request';

// Other Components
import { FeedbackComponent } from './../../feedback/feedback.component';
import { HeaderComponent } from '../../../components/header/header.component';
import { Injectables } from '../../../services/injectables';
import { RequestsService } from '../../../services/requests.service';

@Component({
  selector: 'approve-requests',
  templateUrl: './approve-requests.component.html',
  styleUrls: ['./approve-requests.component.scss']
})
export class ApproveRequestsComponent implements OnInit {

  @ViewChild(HeaderComponent) header: HeaderComponent;
  @ViewChild(FeedbackComponent) feedback: FeedbackComponent;
  requests: Request[];

  constructor( injectables: Injectables, // initilizes the static members on the class Injectables
               private requestsService: RequestsService
  ){} 

  ngOnInit() {
    this.requestsService.getRequests().subscribe(
      (allRequests) => {
        this.requests = allRequests;
      });
  }

  async approve(request: Request) {
    this.submit(()=>request.approve(), "approved");
  }

  async deny(request: Request) {
    this.submit(()=>request.deny(), "denied");
  }

  async submit(action: any, message: string) {
    try {
      await action();
      this.feedback.success("The request has been " + message);
      this.ngOnInit();
      this.header.refreshActions();
    } catch(e) {
      this.feedback.exception(e.message);
    }
  }

}
