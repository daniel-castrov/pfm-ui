import {Component, Input, ViewChild} from '@angular/core';
import {ElevationService} from '../../../services/elevation.component';
import {AuthUser} from '../../../generated/model/authUser';
import {RequestsService} from '../../../services/requests.service';
import {Request} from '../../../services/request';
import {MenuBarComponent} from "../../menu-bar/menu-bar.component";
import {UserActionsComponent} from "../../menu-bar/user-actions/user-actions.component";
import {PrChangeNotification, PrChangeNotificationsService, RolesPermissionsService} from "../../../generated";

@Component({
  selector: 'header-user',
  templateUrl: './header-user.component.html',
  styleUrls: ['./header-user.component.scss']
})
export class HeaderUserComponent {

  @Input() authUser: AuthUser;

  @ViewChild(MenuBarComponent) menuBarComponent: MenuBarComponent;
  @ViewChild(UserActionsComponent) userActionsComponent: UserActionsComponent;

  requests: Request[] = [];
  prChangeNotifications: PrChangeNotification[] = [];

  constructor( public elevationService: ElevationService,
               private requestsService: RequestsService,
               private prChangeNotificationsService: PrChangeNotificationsService,
               private rolesvc: RolesPermissionsService) {
  }

  async ngOnInit() {
    const roles = (await this.rolesvc.getRoles().toPromise()).result;
    if (roles.includes('Funds_Requestor')) {
      this.prChangeNotifications = (await this.prChangeNotificationsService.getByOrganization().toPromise()).result;
    }
    if (roles.includes('User_Approver')) {
      this.requests = await this.requestsService.getRequests().toPromise();
    }
  }

  refresh() {
    this.ngOnInit();
    this.userActionsComponent && this.userActionsComponent.ngOnInit();
  }

}
