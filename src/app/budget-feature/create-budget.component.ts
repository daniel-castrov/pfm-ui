import { Component, OnInit } from '@angular/core';

import { ToastService } from '../pfm-coreui/services/toast.service';
import { BudgetService } from './budget.service';
import { HttpErrorResponse } from '@angular/common/http';

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
    protected budgetService: BudgetService,
    protected toastService: ToastService
  ) {}

  ngOnInit(): void {
    // Values:  4-digit years where the list contains only those years that:
    // have no budget year already created
    // The Programming Phased has been Locked or Closed for the chosen year
    this.budgetService.findAvailableYears().subscribe(res => {
      this.years = res.body ?? [];
      if (this.years.length === 0) {
        this.toastService.displayWarning('No year is available since there are no LOCKED or CLOSED POMs without budgets.');
      }
    });
  }

  create(): void {
    // this.isCreating = true;
    // User must select a year before performing this action
    if (!this.selectedYear) {
      this.toastService.displayWarning('Please select a budget year in the dropdown.');
      this.isCreating = false;
      return;
    }
    // There must not exist a budget phase for this year
    this.budgetService.findByFiscalYear(this.selectedYear).subscribe(() => {
      // if there is a budget, show the warning
      this.toastService.displayWarning('The budget phase already exists for the selected year.');
    }, (httpError: HttpErrorResponse) => {
      // if no budget was found for the selected fiscal year, then we can create a new one
      if (httpError.status === 404) {
        // TODO send the request to create a budget for the current fiscal year
        /*this.budgetService.create(this.selectedYear).subscribe(res => {
          this.isCreating = false;
          this.toastService.displaySuccess('Budget successfully created.');
        }, () => {
          this.isCreating = false;
        });*/
      }
    });
  }

}
