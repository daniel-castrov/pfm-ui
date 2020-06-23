import { Component, OnInit } from '@angular/core';
import { switchMap } from 'rxjs/operators';

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
    this.budgetService.findAvailableYears().subscribe(res => this.years = res.body ?? []);
  }

  create(): void {
    // this.isCreating = true;
    // User must select a year before performing this action
    if (!this.selectedYear) {
      this.toastService.displayWarning('Please select a budget year in the dropdown.');
      this.isCreating = false;
      return;
    }
    // TODO Check to make sure the budget phase for this year does not already exist
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
        }, () => {
          this.isCreating = false;
        });*/
      }
    });
    /*
    Set the Budget Phase status to CREATE

    Create the Budget objects.  Port the CBDP service as your starting point

    be sure the first budget scenario is created at this point.

    What CBDP code does:

    Execution Manager or Funds Manager

    PFM has Execution Manager role but not Funds Manager Role

    Various things:

    Check roles and for existing execution phase

    Budget object is created

    Finally the ID of the newly created Budget Phase is returned to the caller
    */
  }

}
