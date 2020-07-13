import { Component, OnInit } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';

import { ToastService } from '../pfm-coreui/services/toast.service';
import { BudgetService } from './budget.service';
import { VisibilityService } from '../services/visibility-service';
import { LocalVisibilityService } from '../core/local-visibility.service';
import { VisibilityDef } from '../pfm-common-models/visibility-def.model';

@Component({
  selector: 'pfm-create-budget',
  templateUrl: './create-budget.component.html'
})
export class CreateBudgetComponent implements OnInit {
  // list of years for the first dropdown
  years: number[];
  selectedYear: number = null;
  isCreating: boolean;

  constructor(
    protected visibilityService: VisibilityService,
    private localVisibilityService: LocalVisibilityService,
    protected budgetService: BudgetService,
    protected toastService: ToastService
  ) {}

  ngOnInit(): void {
    this.visibilityService.isVisible('budget-phase-component').subscribe(res => {
      const visibilityDef: VisibilityDef = { 'budget-phase-component': (res as any).result };
      this.localVisibilityService.updateVisibilityDef(visibilityDef);
    });
    // Values:  4-digit years where the list contains only those years that:
    // have no budget year already created
    // The Programming Phased has been Locked or Closed for the chosen year
    this.budgetService.findAvailableYears().subscribe(res => {
      this.years = res.body ?? [];
      if (this.years.length === 0) {
        this.toastService.displayError(
          'No year is available since there are no LOCKED or CLOSED POMs without budgets.'
        );
      }
    });
  }

  onClickCreateBudget(): void {
    this.isCreating = true;
    // User must select a year before performing this action
    if (!this.selectedYear) {
      this.toastService.displayWarning('Please select a budget year in the dropdown.');
      this.isCreating = false;
      return;
    }
    // There must not exist a budget phase for this year
    this.budgetService.findByFiscalYear(this.selectedYear).subscribe(
      () => {
        // if there is a budget, show the warning
        this.toastService.displayWarning('The budget phase already exists for the selected year.');
        this.isCreating = false;
      },
      (httpError: HttpErrorResponse) => {
        // if no budget was found for the selected fiscal year, then we can create a new one
        if (httpError.status === 404) {
          // send the request to create a budget for the current fiscal year
          this.budgetService.create(this.selectedYear).subscribe(
            () => {
              this.isCreating = false;
              this.toastService.displaySuccess('Budget successfully created.');
            },
            (err: HttpErrorResponse) => {
              this.isCreating = false;
              this.toastService.displayError(err.error.error);
            }
          );
        }
      }
    );
  }
}
