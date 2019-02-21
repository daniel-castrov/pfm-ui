import { Component, OnChanges, Input } from '@angular/core';
import { Budget, PB, RdteData, R2AData } from '../../../../generated';

@Component({
  selector: 'r2a-tab',
  templateUrl: './r2a-tab.component.html',
  styleUrls: ['../edit-budget-details.component.scss']
})
export class R2aTabComponent implements OnChanges {

  @Input() scenario: PB;
  @Input() budget: Budget;
  @Input() editable: boolean;
  @Input() rdteData: RdteData;

  pes: string[];
  selectedPE: string;
  items: string[];
  selectedItem: string;

  r2adata : R2AData

  constructor() { }

  ngOnChanges() {
    if (this.rdteData.r2Adata){
      this.init();
    }
  }

  async init(){
    this.pes=[];
    this.rdteData.r2Adata.forEach( r2a => { 
      if ( !this.pes.includes( r2a.programElement ) ) 
      this.pes.push(r2a.programElement);
    });    
  }

  onPESelected(){
    this.selectedItem=null;
    let listR2a = this.rdteData.r2Adata.filter( d => d.programElement == this.selectedPE );
    this.items=[];
    listR2a.forEach( dd => this.items.push(dd.item) );
  }

  onItemSelected(){

    this.r2adata = {};
    this.r2adata.programElement = this.selectedPE;
    this.r2adata.item = this.selectedItem;
    this.rdteData.r2Adata.push(this.r2adata);

  }

}
