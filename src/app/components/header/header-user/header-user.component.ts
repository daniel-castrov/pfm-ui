import { Component, OnInit, Input } from '@angular/core';
import { RequestsService } from '../../../services/requests.service';
import { Request } from '../../../services/request';
import { ElevationService } from '../../../services/elevation.component';
import { POMService } from '../../../generated/api/pOM.service';

// Generated
import { AuthUser } from '../../../generated/model/authUser';
import { Pom } from '../../../generated/model/pom';

@Component({
  selector: 'header-user',
  templateUrl: './header-user.component.html',
  styleUrls: ['./header-user.component.scss']
})
export class HeaderUserComponent implements OnInit {

  @Input() isAuthenticated: boolean;
  @Input() authUser: AuthUser;
  requests: Request[];
  pomStatusIsOpen: boolean = false;
  pomStatusIsCreated: boolean = false;
  pomId: string = '';

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

    if ( this.authUser.rolenames.includes('POM_Manager') ){
      this.pomService.getByCommunityId(this.authUser.currentCommunity.id).subscribe(data => {       
        this.pomStatusIsCreated = false;
        this.pomStatusIsOpen = false;

        data.result.forEach((p: Pom) => {
          if ('CREATED' === p.status) {
            this.pomStatusIsCreated = true;
            this.pomId = p.id;
          }
          else if ('OPEN' === p.status) {
            this.pomStatusIsOpen = true;
            this.pomId = p.id;
          }
        });
      });
    }
    
  }
}
