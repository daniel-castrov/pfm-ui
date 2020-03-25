import { Component, OnInit, ViewChild } from '@angular/core';
import { PlanningService } from '../services/planning-service';
import { DialogService } from '../../pfm-coreui/services/dialog.service';
import { ListItem } from '../../pfm-common-models/ListItem';
import { DropdownComponent } from '../../pfm-coreui/form-inputs/dropdown/dropdown.component';
import { Router } from '@angular/router';
import { AppModel } from '../../pfm-common-models/AppModel';
import { ToastService } from 'src/app/pfm-coreui/services/toast.service';

@Component({
  selector: 'pfm-planning',
  templateUrl: './create-planning.component.html',
  styleUrls: ['./create-planning.component.scss']
})
export class CreatePlanningComponent implements OnInit {
  @ViewChild(DropdownComponent, { static: false }) yearDropDown: DropdownComponent;

  id = 'create-planning-component';
  busy: boolean;
  availableYears: ListItem[];
  selectedYear: string;

  constructor(
    private appModel: AppModel,
    private planningService: PlanningService,
    private dialogService: DialogService,
    private toastService: ToastService,
    private router: Router
  ) { }

  yearSelected(year: ListItem): void {
    this.selectedYear = year.value;
  }

  onCreatePlanningPhase(): void {
    const year: any = this.selectedYear;
    if (this.yearDropDown.isValid()) {
      this.busy = true;
      const planningData = this.appModel.planningData.find(obj => obj.id === year + '_id');

      this.planningService.createPlanningPhase(planningData).subscribe(
        resp => {
          this.busy = false;

          // Update model state
          planningData.state = 'CREATED';

          this.toastService.displaySuccess(`Planning phase for ${year} successfully created.`);

          this.router.navigate(['home']);
        },
        error => {
          this.busy = false;
          this.dialogService.displayDebug(error);
        });
    } else {
      this.toastService.displayError(`Please select a year from the dropdown.`);
    }
  }

  ngOnInit() {
    const years: string[] = [];
    for (const item of this.appModel.planningData) {
      if (!item.state) {
        years.push(item.name);
      }
    }
    this.availableYears = this.toListItem(years);
  }

  private toListItem(years: string[]): ListItem[] {
    const items: ListItem[] = [];
    for (const year of years) {
      const item: ListItem = new ListItem();
      item.id = year;
      item.name = year;
      item.value = year;
      item.disabled = !!items.length;
      items.push(item);
    }
    return items;
  }

}
