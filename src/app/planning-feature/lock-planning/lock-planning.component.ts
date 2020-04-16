import { Component, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { AppModel } from '../../pfm-common-models/AppModel';
import { ListItem } from '../../pfm-common-models/ListItem';
import { DropdownComponent } from '../../pfm-coreui/form-inputs/dropdown/dropdown.component';
import { ToastService } from 'src/app/pfm-coreui/services/toast.service';
import { PlanningStatus } from '../models/enumerators/planning-status.model';
import { PlanningService } from '../services/planning-service';
import { DialogService } from 'src/app/pfm-coreui/services/dialog.service';

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

  constructor(
    private appModel: AppModel,
    private router: Router,
    private toastService: ToastService,
    private planningService: PlanningService,
    private dialogService: DialogService
  ) {}

  ngOnInit() {
    const years: string[] = [];
    this.busy = true;
    this.planningService.getAllPlanning().subscribe(
      resp => {
        const planningData = (resp as any).result;
        for (const item of planningData) {
          if (item.state === PlanningStatus.OPEN) {
            years.push(item.name);
          }
        }
        this.availableYears = this.toListItem(years);
      },
      error => {
        this.dialogService.displayDebug(error);
      },
      () => (this.busy = false)
    );
  }

  lockPlanningPhase() {
    this.busy = true;
    if (this.yearDropDown.isValid()) {
      // Update shared model state
      this.appModel.selectedYear = this.selectedYear;

      // Open Mission Priorities
      this.router.navigate([
        '/planning/mission-priorities',
        {
          lockPhase: true
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
    this.lockPlanningPhase();
  }
}
