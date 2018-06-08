import { Component, OnInit, Input } from '@angular/core';
import { RequestsService } from './../../../services/requests.service';
import { Request } from '../../../services/request';
import { ElevationService } from '../../../services/elevation.component';

// Generated
import { AuthUser } from '../../../generated/model/authUser';

@Component({
  selector: 'header-user',
  templateUrl: './header-user.component.html',
  styleUrls: ['./header-user.component.scss']
})
export class HeaderUserComponent implements OnInit {

  @Input() isAuthenticated: boolean;
  @Input() authUser: AuthUser;
  requests:Request[];

  constructor(
    private requestsService: RequestsService,
    private elevationService: ElevationService
  ) {}

  ngOnInit() {
    if (this.authUser.rolenames.includes('User_Approver')) {
      this.requestsService.getRequests().subscribe(
         (allRequests) => this.requests = allRequests );
    } else {
      this.requests = [];
    }
  }

}
