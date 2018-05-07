import { RequestsService } from './../../../services/requests.service';
import { Component, OnInit, Input } from '@angular/core';

// Generated
import { AuthUser } from '../../../generated/model/authUser';
import { Request } from '../../../services/request';
import { ElevationService } from '../../../services/elevation.component';

@Component({
  selector: 'header-user',
  templateUrl: './header-user.component.html',
  styleUrls: ['./header-user.component.scss']
})
export class HeaderUserComponent implements OnInit {

  @Input() isAuthenticated: boolean;
  @Input() authUser: AuthUser;
  requests: Request[];

  constructor(
    private requestsService: RequestsService,
    private elevationService: ElevationService
  ) {}

  ngOnInit() {
    if (this.authUser.rolenames.includes('User_Approver')) {
      this.requests = this.requestsService.getRequests();
    } else {
      this.requests = [];
    }
  }

}
