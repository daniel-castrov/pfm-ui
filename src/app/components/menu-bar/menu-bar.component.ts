import {Component, Input, OnInit, ViewChild} from '@angular/core';
import {RequestsService} from '../../services/requests.service';
import {ElevationService} from '../../services/elevation.component';
import {POMService} from '../../generated/api/pOM.service';
import {AuthUser} from '../../generated/model/authUser';
import {Pom} from '../../generated/model/pom';
import {ReportsMenuComponent} from "./reports-menu/reports-menu.component";
import {ProgrammingMenuComponent} from "./programming-menu/programming-menu.component";
import {PlanningMenuComponent} from "./planning-menu/planning-menu.component";
import {ExecutionMenuComponent} from "./execution-menu/execution-menu.component";
import {BudgetMenuComponent} from "./budget-menu/budget-menu.component";
import {AdminMenuComponent} from "./admin-menu/admin-menu.component";
import {MenageMenuComponent} from "./manage-menu/menage-menu.component";
import {UserActionsComponent} from "./user-actions/user-actions.component";
import {PrChangeNotificationsComponent} from "./pr-change-notofications/pr-change-notifications.component";

@Component({
  selector: 'menu-bar',
  templateUrl: './menu-bar.component.html',
  styleUrls: ['./menu-bar.component.scss']
})
export class MenuBarComponent implements OnInit {

  @Input() authUser: AuthUser;
  pomStatus: Pom.StatusEnum;

  @ViewChild(ReportsMenuComponent) reportsMenuComponent: ReportsMenuComponent;
  @ViewChild(ProgrammingMenuComponent) programmingMenuComponent: ProgrammingMenuComponent;
  @ViewChild(PlanningMenuComponent) planningMenuComponent: PlanningMenuComponent;
  @ViewChild(MenageMenuComponent) menageMenuComponent: MenageMenuComponent;
  @ViewChild(ExecutionMenuComponent) executionMenuComponent: ExecutionMenuComponent;
  @ViewChild(BudgetMenuComponent) budgetMenuComponent: BudgetMenuComponent;
  @ViewChild(AdminMenuComponent) adminMenuComponent: AdminMenuComponent;
  @ViewChild(UserActionsComponent) userActionsComponent: UserActionsComponent;
  @ViewChild(PrChangeNotificationsComponent) prChangeNotificationsComponent: PrChangeNotificationsComponent;

  constructor( private requestsService: RequestsService,
               public elevationService: ElevationService,
               private pomService: POMService ) {}

  async ngOnInit() {
    this.pomService.getByCommunityId(this.authUser.currentCommunity.id).subscribe(data => {
      delete this.pomStatus;
      data.result.forEach((p: Pom) => {
        this.pomStatus = p.status;
      });
    });
  }

  refresh() {
    this.ngOnInit();
    this.reportsMenuComponent.ngOnInit();
    this.programmingMenuComponent.ngOnInit();
    this.planningMenuComponent.ngOnInit();
    this.menageMenuComponent.ngOnInit();
    this.executionMenuComponent.ngOnInit();
    this.budgetMenuComponent.ngOnInit();
    this.adminMenuComponent.ngOnInit();
    this.userActionsComponent && this.userActionsComponent.ngOnInit();
    this.prChangeNotificationsComponent && this.prChangeNotificationsComponent.ngOnInit();
  }
}
