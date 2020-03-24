import { Component, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { AppModel } from '../../pfm-common-models/AppModel';
import { DialogService } from '../../pfm-coreui/services/dialog.service';
import { ListItem } from '../../pfm-common-models/ListItem';
import { SigninService } from '../../pfm-auth-module/services/signin.service';
import { DropdownComponent } from '../../pfm-coreui/form-inputs/dropdown/dropdown.component';
import { RoleConstants } from 'src/app/pfm-common-models/RoleConstants';
import { ToastService } from 'src/app/pfm-coreui/services/toast.service';

@Component({
  selector: 'pfm-planning',
  templateUrl: './lock-planning.component.html',
  styleUrls: ['./lock-planning.component.scss']
})
export class LockPlanningComponent implements OnInit {
  @ViewChild(DropdownComponent, { static: false }) yearDropDown: DropdownComponent;

  id = 'mission-priorities-component';
  busy: boolean;
  availableYears: ListItem[];
  selectedYear: string;
  POMManager = false;

  constructor(
    private appModel: AppModel,
    private dialogService: DialogService,
    private signInService: SigninService,
    private router: Router,
    private toastService: ToastService
  ) { }

  ngOnInit() {
    this.POMManager = this.appModel.userDetails.userRole.isPOMManager;
    const years: string[] = [];
    for (const item of this.appModel.planningData) {
      if (item.state === 'OPEN') {
        years.push(item.name);
      }
    }
    this.availableYears = this.toListItem(years);
  }

  lockPlanningPhase() {
    this.busy = true;
    if (this.yearDropDown.isValid()) {

      // Update shared model state
      this.appModel.selectedYear = this.selectedYear;

      // Open Mission Priorities
      this.router.navigate(['/planning/mission-priorities']);
    } else {
      this.toastService.displayError(`Please select a year from the dropdown.`);
    }
  }

  private toListItem(years: string[]): ListItem[] {
    const items: ListItem[] = [];
    for (const year of years) {
      const item: ListItem = new ListItem();
      item.id = year;
      item.name = year;
      item.value = year;
      items.push(item);
    }
    return items;
  }

  // Check if current user has POM Manager role
  isPOMManager() {
    this.signInService.getUserRoles().subscribe(
      resp => {
        const result: any = resp;
        if (result.result.includes(RoleConstants.POM_MANAGER)) {
          this.POMManager = true;
        }
      },
      error => {
        this.busy = false;
        this.dialogService.displayDebug(error);
      });
  }

  yearSelected(item: any): void {
    this.selectedYear = item ? item.name : undefined;
    this.lockPlanningPhase();
  }
}
