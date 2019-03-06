import {Component, OnInit} from '@angular/core';
import {Router} from '@angular/router';
import {forkJoin} from 'rxjs/observable/forkJoin';
import {Budget, BudgetService, Execution, ExecutionService, PB} from "../../../generated";
import {UserUtils} from "../../../services/user.utils";

@Component({
  selector: 'create-execution-phase',
  templateUrl: './create-execution-phase.component.html',
  styleUrls: ['./create-execution-phase.component.scss']
})
export class CreateExecutionPhaseComponent implements OnInit {

  public yearpblkp: Map<number, PB> = new Map<number, PB>();
  public budget: Budget;
  public fileToUpload: File;
  public message: string;
  public submitted: boolean = false;

  constructor( private budgetService: BudgetService,
               private userUtils: UserUtils,
               private executionService:ExecutionService,
               private router:Router ) {}

  ngOnInit() {
    forkJoin([
      this.executionService.getAll(),
      this.budgetService.getAll()
    ]).subscribe(data => {

      const existingExeYears: Set<number> = new Set<number>();
      data[0].result.forEach((exe: Execution) => {
        existingExeYears.add(exe.fy);
      });

      data[1].result.forEach((budget: Budget) => {
        if (!existingExeYears.has(budget.fy)) {
          this.yearpblkp.set(budget.fy, budget);
          this.budget = budget;
        }
      });
      if (this.yearpblkp.size < 1) {
        this.message = 'All available Execution Phases have been created';
      }
    });
  }

  handleFileInput(files: FileList) {
    this.fileToUpload = files.item(0);
  }

  submit() {
    this.submitted = true;

    this.executionService.createExecution(this.budget.fy, this.fileToUpload).subscribe(data => {
      if (data.result) {
        this.router.navigate(['/home']);
      } else {
        this.message = data.error;
        this.submitted = false;
      }
    });
  }
}
