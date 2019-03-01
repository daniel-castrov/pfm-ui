import {Component, Input, ViewChild} from '@angular/core';
import {ElevationService} from '../../../services/elevation.component';
import {AuthUser} from '../../../generated/model/authUser';
import {RequestsService} from '../../../services/requests.service';
import {Request} from '../../../services/request';
import {MenuBarComponent} from "../../menu-bar/menu-bar.component";
import {UserActionsComponent} from "../../menu-bar/user-actions/user-actions.component";
import {
  BlankService,
  PrChangeNotification,
  PrChangeNotificationsService, RestResult,
  RolesPermissionsService
} from "../../../generated";
import {NgbTooltipConfig} from "@ng-bootstrap/ng-bootstrap";
import {Router} from "@angular/router";
import {HttpResponse} from "@angular/common/http";

@Component({
  selector: 'app-header',
  templateUrl: './app-header.component.html',
  styleUrls: ['./app-header.component.scss']
})
export class AppHeaderComponent {

  authUser: AuthUser;

  @ViewChild(MenuBarComponent) menuBarComponent: MenuBarComponent;
  @ViewChild(UserActionsComponent) userActionsComponent: UserActionsComponent;

  requests: Request[] = [];
  prChangeNotifications: PrChangeNotification[] = [];

  constructor( private blankService: BlankService,
               private config: NgbTooltipConfig,
               private router: Router,
               public elevationService: ElevationService,
               private requestsService: RequestsService,
               private prChangeNotificationsService: PrChangeNotificationsService,
               private rolesvc: RolesPermissionsService) {
    config.placement = 'left';
  }

  async ngOnInit() {
    this.blankService.blank("response", true).subscribe( (httpResponse: HttpResponse<RestResult>) => {
      const authHeader = httpResponse.headers.get('Authorization');
      if(authHeader) {
        this.authUser = JSON.parse(atob(authHeader));
        if (!this.authUser.currentCommunity) {
          this.router.navigate(['my-community'])
        }
      } else {
        this.router.navigate(['apply'])
      }
    },
    ()=>{
      this.router.navigate(['/'])
    });

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
    this.menuBarComponent.refresh();
  }

}
