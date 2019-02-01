import {Component, OnInit} from '@angular/core';
import {RequestsService} from '../../../services/requests.service';
import {Request} from '../../../services/request';

@Component({
  selector: 'user-actions',
  templateUrl: './user-actions.component.html',
  styleUrls: ['./user-actions.component.scss']
})
export class UserActionsComponent implements OnInit {

  // requests: Request[];

  constructor( private requestsService: RequestsService ) {}

  async ngOnInit() {
    // this.requests = await this.requestsService.getRequests().toPromise();
  }
}
