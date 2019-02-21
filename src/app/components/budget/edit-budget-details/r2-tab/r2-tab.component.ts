import { Component, OnChanges, Input } from '@angular/core';
import { Budget, PB, RdteData, R2Data } from '../../../../generated';

@Component({
  selector: 'r2-tab',
  templateUrl: './r2-tab.component.html',
  styleUrls: ['../edit-budget-details.component.scss']
})
export class R2TabComponent implements OnChanges {

  @Input() scenario: PB;
  @Input() budget: Budget;
  @Input() editable: boolean;
  @Input() rdteData: RdteData;

  pes: string[];
  selectedPE: string;
  r2data:R2Data

  constructor() { 

  }

  ngOnChanges() {
    this.init();
  }

  async init(){
    this.pes=[];
    this.rdteData.r2data.forEach( r2 => this.pes.push(r2.programElement) );    
  }

  onPESelected(){
    this.r2data = {};
    this.r2data.programElement = this.selectedPE;
    this.rdteData.r2data.push(this.r2data);
  }


}
