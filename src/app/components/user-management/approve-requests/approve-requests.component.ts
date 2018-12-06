import { Component, ViewChild, OnInit } from '@angular/core';
import { Request } from '../../../services/request';

// Other Components
import { HeaderComponent } from '../../header/header.component';
import { Injectables } from '../../../services/injectables';
import { RequestsService } from '../../../services/requests.service';
import { Notify } from '../../../utils/Notify';

@Component({
  selector: 'approve-requests',
  templateUrl: './approve-requests.component.html',
  styleUrls: ['./approve-requests.component.scss']
})
export class ApproveRequestsComponent implements OnInit {

  @ViewChild(HeaderComponent) header: HeaderComponent;

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
      Notify.success("The request has been " + message);
      this.ngOnInit();
      this.header.refresh();
    } catch(e) {
      Notify.exception(e.message);
    }
  }

}
