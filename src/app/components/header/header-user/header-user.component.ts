import { Component, OnInit, Input } from '@angular/core';
import { RequestsService } from '../../../services/requests.service';
import { Request } from '../../../services/request';
import { ElevationService } from '../../../services/elevation.component';
import { POMService } from '../../../generated/api/pOM.service';
import { RolesPermissionsService } from '../../../generated/api/rolesPermissions.service' 


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
  pomStatus: Pom.StatusEnum;
  pomId: string = '';
  roles: string[];

  constructor(
    private requestsService: RequestsService,
    private elevationService: ElevationService,
    private pomService: POMService,
    private rolesPermissionsService: RolesPermissionsService
  ) {}

  ngOnInit() {

    this.rolesPermissionsService.getRoles().subscribe( data => {
      this.roles = data.result;
      
      if (this.roles.includes('User_Approver')) {
        this.requestsService.getRequests().subscribe(
          (allRequests) => this.requests = allRequests );
      } else {
        this.requests = [];
      }

      if ( this.roles.includes('POM_Manager') || this.roles.includes('Funds_Requestor') ){
        this.pomService.getByCommunityId(this.authUser.currentCommunity.id).subscribe(data => {       
          delete this.pomStatus;
          data.result.forEach((p: Pom) => {
            this.pomStatus = p.status;
            this.pomId = p.id;
          });
        });
      }
    });
  }
}
