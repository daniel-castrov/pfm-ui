import { Component, OnInit, ViewChild } from '@angular/core';
import { PlanningService } from '../services/planning-service';
import { DialogService } from '../../pfm-coreui/services/dialog.service';
import { ListItem } from '../../pfm-common-models/ListItem';
import { DropdownComponent } from '../../pfm-coreui/form-inputs/dropdown/dropdown.component';
import { Router } from '@angular/router';
import { AppModel } from '../../pfm-common-models/AppModel';
import { ToastService } from 'src/app/pfm-coreui/services/toast.service';
import { PlanningStatus } from '../models/enumerators/planning-status.model';

@Component({
  selector: 'pfm-planning',
  templateUrl: './create-planning.component.html',
  styleUrls: ['./create-planning.component.scss']
})
export class CreatePlanningComponent implements OnInit {
  @ViewChild(DropdownComponent) yearDropDown: DropdownComponent;

  id = 'create-planning-component';
  busy: boolean;
  availableYears: ListItem[];
  selectedYear: string;

  yearSkipDialog: DialogInterface = {
    title: 'Caution',
    bodyText:
      'Warning! You have skipped over one or more years. ' +
      'If you continue, the skipped years will never be available for planning. ' +
      'Do you want to continue?'
  };

  constructor(
    private appModel: AppModel,
    private planningService: PlanningService,
    private dialogService: DialogService,
    private toastService: ToastService,
    private router: Router
  ) {}

  ngOnInit() {
    const years: string[] = [];
    const createdYears = this.appModel.planningData.filter(year => year.state);
    const maxCreatedYear = Math.max(...createdYears.map(year => year.year));
    for (const item of this.appModel.planningData) {
      if (item.year > maxCreatedYear) {
        years.push(item.name);
      }
    }
    this.availableYears = this.toListItem(years);
  }

  yearSelected(year: ListItem): void {
    this.selectedYear = year.value;
  }

  onCreatePlanningPhase(): void {
    const year: any = this.selectedYear;
    if (this.yearDropDown.isValid()) {
      if (this.availableYears[0].value === year) {
        this.performPlanningPhaseCreation(year);
      } else {
        this.yearSkipDialog.display = true;
      }
    } else {
      this.toastService.displayError(`Please select a year from the dropdown.`);
    }
  }

  onYearSkipData() {
    this.performPlanningPhaseCreation(Number(this.selectedYear));
  }

  onCancelYearSkipDialog() {
    this.yearSkipDialog.display = false;
  }

  performPlanningPhaseCreation(year: number) {
    this.busy = true;
    const planningData = this.appModel.planningData.find(obj => obj.id === year + '_id');
    this.planningService.createPlanningPhase(planningData).subscribe(
      resp => {
        this.busy = false;

        // Update model state
        planningData.state = PlanningStatus.CREATED;
        this.appModel.selectedYear = this.selectedYear;

        this.toastService.displaySuccess(`Planning phase for ${year} successfully created.`);

        this.router.navigate(['/planning/mission-priorities']);
      },
      error => {
        this.busy = false;
        this.dialogService.displayDebug(error);
      }
    );
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
}

export interface DialogInterface {
  title: string;
  bodyText?: string;
  display?: boolean;
}
