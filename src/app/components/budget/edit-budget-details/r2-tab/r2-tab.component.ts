import {Component, Input, OnChanges} from '@angular/core';
import {LockPositionService, R2Data, RdteBudgetData} from '../../../../generated';

@Component({
  selector: 'r2-tab',
  templateUrl: './r2-tab.component.html',
  styleUrls: ['../edit-budget-details.component.scss']
})
export class R2TabComponent implements OnChanges {

  @Input() rdteBudgetData: RdteBudgetData;

  pes: string[];
  selectedPE: string;
  r2Data: R2Data;
  lockPositionExists: boolean;

  selChgSumSection: string;
  changeSummSections = [ "Funding", "Schedule", "Technical"];

  constructor(private lockPositionService: LockPositionService) {}

  clearData() {
    this.r2Data={};
    this.selectedPE=null;
  }

  ngOnChanges() {
    if (this.rdteBudgetData && this.rdteBudgetData.r2Data){
      this.pes = [];
      this.rdteBudgetData.r2Data.forEach(r2Data => this.pes.push(r2Data.programElement));
      this.pes.sort();
    }
  }

  async onPESelected() {
    this.r2Data = this.rdteBudgetData.r2Data.find(r2Data => r2Data.programElement == this.selectedPE );
    this.lockPositionExists = (await this.lockPositionService.getLatestForScenario(this.rdteBudgetData.containerId).toPromise()).result != null;
  }

}
