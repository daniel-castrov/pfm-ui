import {Component, Input, OnChanges, ViewChild} from '@angular/core';
import {R2AProgramData} from '../../../../generated';
import {RdteProgramContextService} from '../rdte-program-context.service';
import {SectionBComponent} from './section-b/section-b.component';
import {SectionAComponent} from './section-a/section-a.component';
import {SectionDComponent} from './section-d/section-d.component';
import {SectionEComponent} from './section-e/section-e.component';

@Component({
  selector: 'r2a-tab-on-program-details',
  templateUrl: './r2a-tab-component-on-program-details.component.html',
  styleUrls: ['../edit-program-details.component.scss']
})
export class R2aTabComponentOnProgramDetails implements OnChanges {

  @Input() r2AData: R2AProgramData;
  @ViewChild('sectionA') sectionA: SectionAComponent;
  @ViewChild('sectionB') sectionB: SectionBComponent;
  @ViewChild('sectionD') sectionD: SectionDComponent;
  @ViewChild('sectionE') sectionE: SectionEComponent;
  selectedSection: string = null;

  constructor( private rdteProgramContextService: RdteProgramContextService ) {}

  ngOnChanges() {
    if (!this.r2AData) return;
    if (!this.r2AData.acquisitionStrategyTitle) {
      this.prepopulateR2AData();
    }
  }

  private async prepopulateR2AData() {
    this.r2AData.acquisitionStrategyTitle = this.rdteProgramContextService.program().longName;
    this.r2AData.performanceMetricsTitle = this.rdteProgramContextService.program().longName;
    if (['BA1', 'BA2', 'BA3', 'BA6'].includes(this.rdteProgramContextService.ba().toUpperCase()) ) {
      this.r2AData.acquisitionStrategyContent = 'N/A';
    }
    this.r2AData.performanceMetricsContent = 'N/A';
  }

  invalid(): boolean {
    return !this.r2AData.missionDescription ||
      (this.sectionB ? this.sectionB.invalid() : this.r2AData.bullets && this.r2AData.bullets.length === 0) ||
      !this.r2AData.acquisitionStrategyContent ||
      !this.r2AData.performanceMetricsContent;
  }

}
