import {Component, OnInit, ViewChild} from '@angular/core';
import { Router } from '@angular/router';
import { ListItem } from '../../pfm-common-models/ListItem';
import { AppModel } from '../../pfm-common-models/AppModel';
import { PlanningService } from '../services/planning-service';
import { DialogService } from '../../pfm-coreui/services/dialog.service';
import { ActivatedRoute } from '@angular/router';
import { SigninService } from '../../pfm-auth-module/services/signin.service';
import {DropdownComponent} from '../../pfm-coreui/form-inputs/dropdown/dropdown.component';

@Component({
  selector: 'pfm-planning',
  templateUrl: './close-planning.component.html',
  styleUrls: ['./close-planning.component.scss']
})
export class ClosePlanningComponent implements OnInit {
  @ViewChild(DropdownComponent, {static: false}) yearDropDown: DropdownComponent;

  id = 'mission-priorities-component';
  busy: boolean;
  availableYears: ListItem[];
  selectedYear: string;
  POMManager = false;

  constructor(private appModel: AppModel, private planningService: PlanningService, private dialogService: DialogService, private route: ActivatedRoute, private signInService: SigninService, private router: Router) { }

  ngOnInit() {
    this.POMManager = this.appModel.userDetails.userRole.isPOM_Manager;
    const years: string[] = [];
    for (const item of this.appModel.planningData) {
      if (item.state === 'LOCKED') {
        years.push(item.name);
      }
    }
    this.availableYears = this.toListItem(years);
  }

  closePlanningPhase() {
    this.busy = true;
    if (this.yearDropDown.isValid()) {
      // Update shared model state
      this.appModel.selectedYear = this.selectedYear;

      // Open Mission Priorities
      this.router.navigate(['/planning/mission-priorities']);
    } else {
      this.dialogService.displayToastError(`Please select a year from the dropdown.`);
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

  // check if current user has POM Manager role
  isPOMManager() {
    this.signInService.getUserRoles().subscribe(
      resp  => {
        const result: any = resp;
        if (result.result.includes('POM_Manager')) {
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
    this.closePlanningPhase();
  }
}
