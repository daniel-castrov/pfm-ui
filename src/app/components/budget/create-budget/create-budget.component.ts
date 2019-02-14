import {Component, OnInit, ViewChild} from '@angular/core';
import {HeaderComponent} from '../../header/header.component';
import {Budget, BudgetService, Pom, POMService} from "../../../generated";
import {Router} from "@angular/router";

@Component({
  selector: 'create-budget',
  templateUrl: './create-budget.component.html',
  styleUrls: ['./create-budget.component.scss']
})
export class CreateBudgetComponent implements OnInit {

  @ViewChild(HeaderComponent) header;

  budgets: Budget[];
  nextBudgetYear: number;
  poms: Pom[];

  constructor( private budgetService: BudgetService,
               private pomService: POMService,
               private router: Router ) {}

  async ngOnInit() {
    this.budgets = (await this.budgetService.getAll().toPromise()).result;
    this.budgets.sort((a, b) => b.fy-a.fy);
    this.nextBudgetYear =this.budgets[0].fy+1;

    this.poms = (await this.pomService.getAll().toPromise()).result;
    this.poms.sort((a, b) => b.fy-a.fy);
  }

  createBudget() {
    this.budgetService.createBudget(this.nextBudgetYear).subscribe();
    this.router.navigate(['/home'])
  }
}
