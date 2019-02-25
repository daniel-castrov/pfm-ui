import { Component, OnChanges, Input } from '@angular/core';
import { RdteData, R2Data } from '../../../../generated';

@Component({
  selector: 'r2-tab',
  templateUrl: './r2-tab.component.html',
  styleUrls: ['../edit-budget-details.component.scss']
})
export class R2TabComponent implements OnChanges {

  @Input() rdteData: RdteData;

  pes: string[];
  selectedPE: string;
  r2data:R2Data

  constructor() { 
  }

  clearData(){
    this.r2data={}; 
    this.selectedPE=null;
  }
  ngOnChanges() {
    if (this.rdteData && this.rdteData.r2data){
      this.init();
    }
  }

  async init(){
    this.pes=[];
    this.rdteData.r2data.forEach( r2 => this.pes.push(r2.programElement) ); 
    this.pes.sort();
  }

  onPESelected(){
    this.r2data = this.rdteData.r2data.find( data =>  data.programElement == this.selectedPE  );
  }


}
