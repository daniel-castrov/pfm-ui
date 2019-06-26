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
import {ManageMenuComponent} from "./manage-menu/manage-menu.component";
import {UserActionsComponent} from "./user-actions/user-actions.component";
import {PrChangeNotificationsComponent} from "./pr-change-notofications/pr-change-notifications.component";
import { onMainContentChange ,onSideNavChange, animateText} from './animation/animation';
import { MatSidenav, } from '@angular/material';
import { UserUtils } from '../../services/user.utils';
import { SidenavService } from './service/service';

@Component({
  selector: 'menu-bar',
  templateUrl: './menu-bar.component.html',
  styleUrls: ['./menu-bar.component.scss'],
  animations: [ onMainContentChange,onSideNavChange, animateText ]
})
export class MenuBarComponent implements OnInit {
  disable : boolean = false;
  enable : boolean = true;
  @Input() authUser: AuthUser;
  pomStatus: Pom.StatusEnum;
  public onSideNavChange: boolean;
  @Input() sidenav: MatSidenav;
  
    public sideNavState: boolean = false;
    public linkText: boolean = false;

  @ViewChild(ReportsMenuComponent) reportsMenuComponent: ReportsMenuComponent;
  @ViewChild(ProgrammingMenuComponent) programmingMenuComponent: ProgrammingMenuComponent;
  @ViewChild(PlanningMenuComponent) planningMenuComponent: PlanningMenuComponent;
  @ViewChild(ManageMenuComponent) manageMenuComponent: ManageMenuComponent;
  @ViewChild(ExecutionMenuComponent) executionMenuComponent: ExecutionMenuComponent;
  @ViewChild(BudgetMenuComponent) budgetMenuComponent: BudgetMenuComponent;
  @ViewChild(AdminMenuComponent) adminMenuComponent: AdminMenuComponent;
  @ViewChild(UserActionsComponent) userActionsComponent: UserActionsComponent;
  @ViewChild(PrChangeNotificationsComponent) prChangeNotificationsComponent: PrChangeNotificationsComponent;
  roles: string[];
  
  constructor( private requestsService: RequestsService,
               public elevationService: ElevationService,
               private pomService: POMService ,
               private userUtils: UserUtils,
               private service : SidenavService,) {
                this.service.sideNavState$.subscribe( res => {
                  console.log(res)
                  this.onSideNavChange = res;
                })
               }

  async ngOnInit() {
    this.pomService.getAll().subscribe(data => {
      delete this.pomStatus;
      data.result.forEach((p: Pom) => {
        this.pomStatus = p.status;
      });
    });
    this.roles = await this.userUtils.roles().toPromise();
  }

  onSinenavToggle() {
    this.sideNavState = !this.sideNavState
    
    setTimeout(() => {
      this.linkText = this.sideNavState;
    }, 200)
    this.service.sideNavState$.next(this.sideNavState)
  }

  refresh() {
    this.ngOnInit();
    this.reportsMenuComponent.ngOnInit();
    this.programmingMenuComponent.ngOnInit();
    this.planningMenuComponent.ngOnInit();
    this.manageMenuComponent.ngOnInit();
    this.executionMenuComponent.ngOnInit();
    this.budgetMenuComponent.ngOnInit();
    this.adminMenuComponent.ngOnInit();
    this.userActionsComponent && this.userActionsComponent.ngOnInit();
    this.prChangeNotificationsComponent && this.prChangeNotificationsComponent.ngOnInit();
  }
}
