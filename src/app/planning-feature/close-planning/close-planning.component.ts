import { Component, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { ListItem } from '../../pfm-common-models/ListItem';
import { AppModel } from '../../pfm-common-models/AppModel';
import { DropdownComponent } from '../../pfm-coreui/form-inputs/dropdown/dropdown.component';
import { ToastService } from 'src/app/pfm-coreui/services/toast.service';
import { PlanningStatus } from '../models/enumerators/planning-status.model';

@Component({
  selector: 'pfm-planning',
  templateUrl: './close-planning.component.html',
  styleUrls: ['./close-planning.component.scss']
})
export class ClosePlanningComponent implements OnInit {
  @ViewChild(DropdownComponent) yearDropDown: DropdownComponent;

  id = 'mission-priorities-component';
  busy: boolean;
  availableYears: ListItem[];
  selectedYear: string;

  constructor(private appModel: AppModel, private router: Router, private toastService: ToastService) {}

  ngOnInit() {
    const years: string[] = [];
    for (const item of this.appModel.planningData) {
      if (item.state === PlanningStatus.LOCKED) {
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
      this.router.navigate([
        '/planning/mission-priorities',
        {
          closePhase: true
        }
      ]);
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

  yearSelected(item: any): void {
    this.selectedYear = item ? item.name : undefined;
    this.closePlanningPhase();
  }
}
