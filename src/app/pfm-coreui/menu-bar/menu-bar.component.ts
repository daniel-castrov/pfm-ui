import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { UserRole } from '../../pfm-common-models/UserRole';
import { animateText } from './animation';
import { MenuBarItem } from '../models/MenuBarItem';
import { NavigationStart, Router } from '@angular/router';

@Component({
  selector: 'pfm-menu-bar',
  templateUrl: './menu-bar.component.html',
  styleUrls: ['./menu-bar.component.scss'],
  animations: [animateText]
})
export class MenuBarComponent implements OnInit {
  @Input() linkText: boolean;
  @Input() role: UserRole;
  @Input() elevatedBoolean;
  @Input() isUserSignedIn: boolean;
  @Input() menuBarItems: MenuBarItem[];
  @Output() menuToogle = new EventEmitter<boolean>();

  isOpen: boolean;
  isDashboardSelected: boolean;
  isPlanningSelected: boolean;
  isProgrammingSelected: boolean;
  isBudgetSelected: boolean;
  isExecutionSelected: boolean;
  isReportsSelected: boolean;
  isManageSelected: boolean;
  isAdminSelected: boolean;
  selectedItem: string;
  ignoreSelectedScreen: boolean;

  constructor(private router: Router) {}

  onHide(screen: string) {
    if (!this.ignoreSelectedScreen) {
      this.selectedItem = screen;
    }
    if (this.selectedItem) {
      this.DeselecteItem();
    } else {
      this.ignoreSelectedScreen = true;
      this.selectedItem = undefined;
    }
  }

  onShow(screen: string) {
    this.selectedItem = screen;
    this.ignoreSelectedScreen = false;
  }

  onSelect(name: string) {
    if (name) {
      this.clearSelection(true);
      switch (name.toLowerCase()) {
        case Screen.DASHBOARD:
          this.isDashboardSelected = true;
          break;
        case Screen.PLANNING:
          this.isPlanningSelected = true;
          break;
        case Screen.PROGRAMMING:
          this.isProgrammingSelected = true;
          break;
        case Screen.BUDGET:
          this.isBudgetSelected = true;
          break;
        case Screen.EXECUTION:
          this.isExecutionSelected = true;
          break;
        case Screen.MANAGE:
          this.isManageSelected = true;
          break;
        case Screen.REPORTS:
          this.isReportsSelected = true;
          break;
        case Screen.ADMIN:
          this.isAdminSelected = true;
          break;
      }
    }
  }

  clearSelection(clearSingle: boolean) {
    if (clearSingle) {
      this.isDashboardSelected = false;
      this.isBudgetSelected = false;
      this.isReportsSelected = false;
      this.isManageSelected = false;
    }
    this.isPlanningSelected = false;
    this.isProgrammingSelected = false;
    this.isExecutionSelected = false;
    this.isAdminSelected = false;
  }

  DeselecteItem() {
    if (this.selectedItem) {
      switch (this.selectedItem.toLowerCase()) {
        case Screen.PLANNING:
          this.isPlanningSelected = false;
          break;
        case Screen.PROGRAMMING:
          this.isProgrammingSelected = false;
          break;
        case Screen.EXECUTION:
          this.isExecutionSelected = false;
          break;
        case Screen.ADMIN:
          this.isAdminSelected = false;
          break;
      }
    }
  }

  toogleMenu() {
    this.isOpen = !this.isOpen;
    this.menuToogle.emit(this.isOpen);
  }

  ngOnInit() {
    this.router.events.forEach(event => {
      if (event instanceof NavigationStart) {
        if (event.url.startsWith('/planning')) {
          this.isDashboardSelected = false;
          this.isPlanningSelected = true;
        } else if (event.url.startsWith('/home')) {
          this.isPlanningSelected = false;
          this.isDashboardSelected = true;
        }
      }
    });
  }

  isParentSelected(url: string): boolean {
    return this.router.url.includes(url);
  }
}

enum Screen {
  DASHBOARD = 'dashboard',
  PLANNING = 'planning',
  PROGRAMMING = 'programming',
  BUDGET = 'budget',
  EXECUTION = 'execution',
  MANAGE = 'manage',
  REPORTS = 'reports',
  ADMIN = 'admin'
}
