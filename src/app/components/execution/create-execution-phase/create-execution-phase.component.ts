import {Component, OnInit} from '@angular/core';
import {Router} from '@angular/router';
import {Budget, ExecutionService} from "../../../generated";
import {Notify} from "../../../utils/Notify";
import {ExecutionCreationService} from "./execution-creation.service";

@Component({
  selector: 'create-execution-phase',
  templateUrl: './create-execution-phase.component.html',
  styleUrls: ['./create-execution-phase.component.scss']
})
export class CreateExecutionPhaseComponent implements OnInit {

  public budgetsReadyForExecutionPhaseCreation: Budget[];
  public budget: Budget;
  public fileToUpload: File;
  public error: string;
  public spinner: boolean = false;

  constructor( private executionCreationService: ExecutionCreationService,
               private executionService: ExecutionService,
               private router: Router ) {}

  async ngOnInit() {
    this.budgetsReadyForExecutionPhaseCreation = await this.executionCreationService.getBudgetsReadyForExecutionPhaseCreation();
    if (this.budgetsReadyForExecutionPhaseCreation.length < 1) {
      this.error = 'All available Execution Phases have been created';
    } else {
      this.budget = this.budgetsReadyForExecutionPhaseCreation[0];
    }
  }

  handleFileInput(files: FileList) {
    this.fileToUpload = files.item(0);
  }

  async submit() {
    this.spinner = true;
    try {
      await this.executionService.createExecution(this.budget.fy, this.fileToUpload).toPromise();
      Notify.success("Execution phase FY" + (this.budget.fy-2000) + " has been created");
      this.router.navigate(['/home']);
    } catch (e) {
      this.spinner = false;
    }
  }
}
