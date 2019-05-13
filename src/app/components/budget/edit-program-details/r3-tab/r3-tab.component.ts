import {Component, Input, OnChanges, ViewChild} from '@angular/core';
import {R3Data} from '../../../../generated';
import {R3SummaryComponent} from './r3-summary/r3-summary.component';
import {R3EntriesComponent} from './r3-entries/r3-entries.component';

@Component({
  selector: 'r3-tab',
  templateUrl: './r3-tab.component.html',
  styleUrls: ['./r3-tab.component.scss']
})
export class R3TabComponent implements OnChanges {

  @Input() r3Data: R3Data;

  @ViewChild (R3SummaryComponent) r3SummaryComponent: R3SummaryComponent
  @ViewChild (R3EntriesComponent) r3Entries: R3EntriesComponent;

  ngOnChanges(): void {
    if(!this.r3Data) return;
    if(!this.r3Data.entries) {
      this.r3Data.entries = [];
    }
    if (!this.r3Data.remarks) {
      this.r3Data.remarks = '';
    }
  }

  r3SummarySizeColumnsToFit() {
    this.r3SummaryComponent.sizeColumnsToFit();
  }

  invalid(): boolean {
    return this.r3Entries.invalid() || this.r3SummaryComponent.invalid();
  }

  refresh(){
    this.r3SummaryComponent.populateRowData();
  }

}
