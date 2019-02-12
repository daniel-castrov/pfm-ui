import { Component, OnInit, ViewChild } from '@angular/core';
import * as $ from 'jquery';

// Other Components
import { HeaderComponent } from '../../header/header.component';
import { Router } from '@angular/router';
import { forkJoin } from 'rxjs/observable/forkJoin';
import { BudgetService, ExecutionService, Execution, Budget, PB } from "../../../generated";
import {UserUtils} from "../../../services/user.utils";

declare const $: any;
declare const jQuery: any;

@Component({
  selector: 'create-execution-phase',
  templateUrl: './create-execution-phase.component.html',
  styleUrls: ['./create-execution-phase.component.scss']
})
export class CreateExecutionPhaseComponent implements OnInit {

  @ViewChild(HeaderComponent) header;

  private yearpblkp: Map<number, PB> = new Map<number, PB>();
  private budget: Budget;
  private fileToUpload: File;

  private message: string;
  private submitted: boolean = false;

  constructor( private budgetService: BudgetService,
               private userUtils: UserUtils,
               private esvc:ExecutionService,
               private router:Router ) { }

  ngOnInit() {
    var fn = function(e) {
			if (!/zmore/.test(e.target.className)) { $('#dmore').hide(); }
		}
		document.addEventListener('click', fn);
		document.addEventListener('touchstart', fn);

    this.userUtils.user().subscribe(p => {
      forkJoin([
        this.esvc.getByCommunityId(p.currentCommunityId),
        this.budgetService.getBudgets()
      ]).subscribe(data => {
        
        var existingExeYears: Set<number> = new Set<number>();
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
    });
  }

  handleFileInput(files: FileList) {
    this.fileToUpload = files.item(0);
  }


  submit() {
    this.submitted = true;
    var my: CreateExecutionPhaseComponent = this;

    this.esvc.createExecution(this.budget.communityId, this.budget.fy, this.fileToUpload,
      this.budget.finalPbId ).subscribe(data => {
      if (data.result) {
        my.router.navigate(['/home']);
      }
      else {
        my.message = data.error;
      }
    });
  }
}
