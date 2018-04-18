import { Component, ViewChild } from '@angular/core';
import { Request } from '../../../services/request';

// Other Components
import { FeedbackComponent } from './../../feedback/feedback.component';
import { HeaderComponent } from '../../../components/header/header.component';
import { Injectables } from '../../../services/injectables';

@Component({
  selector: 'approve-requests',
  templateUrl: './approve-requests.component.html',
  styleUrls: ['./approve-requests.component.scss']
})
export class ApproveRequestsComponent {

  @ViewChild(HeaderComponent) header: HeaderComponent;
  @ViewChild(FeedbackComponent) feedback: FeedbackComponent;

  constructor(injectables: Injectables){} // initilizes the static members on the class Injectables

  async approve(request: Request) {
    await request.approve();
    this.feedback.flash("The request has been approved.");
    this.header.ngOnInit();
  }

  async deny(request: Request) {
    await request.deny();
    this.feedback.flash("The request has been denied.");
    this.header.ngOnInit();
  }

}
