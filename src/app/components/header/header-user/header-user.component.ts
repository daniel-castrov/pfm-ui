import { Component, OnInit, Input } from '@angular/core';
import { RequestsService } from './../../../services/requests.service';
import { Request } from '../../../services/request';
import { ElevationService } from '../../../services/elevation.component';
import { POMService } from '../../../generated/api/pOM.service';

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
  requests: Request[];
  pomIsOpen: boolean = false;

  constructor(
    private requestsService: RequestsService,
    private elevationService: ElevationService,
    private pomService: POMService
  ) {}

  ngOnInit() {
    if (this.authUser.rolenames.includes('User_Approver')) {
      this.requestsService.getRequests().subscribe(
         (allRequests) => this.requests = allRequests );
    } else {
      this.requests = [];
    }

    this.pomService.isOpen(this.authUser.currentCommunity.id).subscribe(data => { 
      this.pomIsOpen = data.result;
    });

  }

}
