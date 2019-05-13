import {Component, Input, OnChanges, OnInit} from '@angular/core';
import {R2ABudgetData, RdteBudgetData, Tag} from '../../../../generated';
import {TagsUtils, TagType} from '../../../../services/tags-utils.service';

@Component({
  selector: 'r2a-tab-on-budget-details',
  templateUrl: './r2a-tab-component-on-budget-details.component.html',
  styleUrls: ['../edit-budget-details.component.scss']
})
export class R2aTabComponentOnBudgetDetails implements OnInit, OnChanges {

  @Input() rdteBudgetData: RdteBudgetData;

  pes: string[];
  selectedPE: string;
  items: string[];
  selectedItem: string;
  r2AData : R2ABudgetData;
  allItems: string[];
  relatedItems: string[];
  relatedItem: string="";
  itemTags: Tag[];

  cleardata() {
    this.r2AData={};
    this.selectedPE=null;
    this.selectedItem=null;
  }

  constructor( private tagsUtils: TagsUtils ) {}

  async ngOnInit() {
    this.itemTags = await this.tagsUtils.tags(TagType.ITEM).toPromise();
  }

  ngOnChanges() {
    if (!this.rdteBudgetData || !this.rdteBudgetData.r2AData) return;

    this.pes=[];
    this.allItems=[];
    this.relatedItems=[];
    this.rdteBudgetData.r2AData.forEach(r2AData => {
      if ( !this.pes.includes( r2AData.pe ) ) {
        this.pes.push(r2AData.pe);
      }
      if ( !this.allItems.includes( r2AData.item ) ) {
        this.allItems.push( r2AData.item );
      }
    });
    this.pes.sort();
    this.allItems.sort();
  }

  onPESelected() {
    this.selectedItem=undefined;
    this.items = this.rdteBudgetData.r2AData
          .filter(r2AData => r2AData.pe === this.selectedPE)
          .map(r2AData => r2AData.item)
          .sort();
  }

  onItemSelected() {
    this.relatedItem="";
    this.r2AData = this.rdteBudgetData.r2AData.find( r2AData => r2AData.pe === this.selectedPE &&
                                                                        r2AData.item === this.selectedItem );
    this.relatedItems = [...this.r2AData.relatedItems].sort();
  }

  onRelatedItemSelected() {
    if ( !this.relatedItems.includes( this.relatedItem ) ) {
      this.relatedItems.push(this.relatedItem);
      this.relatedItems.sort();
      this.r2AData.relatedItems=this.relatedItems;
    }
  }

  removeRelated( itemToRemove:string ) {
    this.relatedItems = this.relatedItems.filter( item => item != itemToRemove );
    this.r2AData.relatedItems=this.relatedItems;
  }

  getItemDescription( item:string) : string {
    const tag = this.itemTags.find( tag => tag.abbr===item );
    return tag ? tag.name : "";
  }

}
