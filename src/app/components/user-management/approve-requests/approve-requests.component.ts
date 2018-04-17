import { Component, ViewChild, OnInit } from '@angular/core';
import { Request } from '../../../services/request';

// Other Components
import { HeaderComponent } from '../../../components/header/header.component';
import { Injectables } from '../../../services/injectables';

@Component({
  selector: 'approve-requests',
  templateUrl: './approve-requests.component.html',
  styleUrls: ['./approve-requests.component.scss']
})
export class ApproveRequestsComponent {

  @ViewChild(HeaderComponent) header: HeaderComponent;
  messageIsHidden: boolean = true;

  constructor(injectables: Injectables){} // initilizes the static members on the class Injectables

  async approve(request: Request) {
    await request.approve();
    this.flashMessage()
    this.header.ngOnInit();
  }

  async deny(request: Request) {
    await request.deny();
    this.flashMessage()
    this.header.ngOnInit();
  }

  private flashMessage() {
    this.messageIsHidden = false;
    setInterval(() => this.messageIsHidden = true, 5000);
  }

}
