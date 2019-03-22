import { Component, OnChanges, Input } from '@angular/core';
import {RdteData, Item, Tag, R2Data} from '../../../../generated';
import { TagsService, TagType } from '../../../../services/tags.service';

@Component({
  selector: 'r2a-tab',
  templateUrl: './r2a-tab.component.html',
  styleUrls: ['../edit-budget-details.component.scss']
})
export class R2aTabComponent implements OnChanges {

  @Input() rdteData: RdteData;

  pes: string[];
  selectedPE: string;
  items: string[];
  selectedItem: string;
  r2Data : R2Data;
  item: Item;
  allItems: string[];
  relatedItems: string[];
  relatedItem: string="";
  itemTags: Tag[];

  cleardata() {
    this.r2Data={};
    this.selectedPE=null;
    this.selectedItem=null;
  }

  constructor( private tagsService: TagsService ) {}

  ngOnChanges() {
    if (this.rdteData && this.rdteData.r2data && this.rdteData.r2data) {
      this.init();
    }
  }

  async init() {
    this.pes=[];
    this.allItems=[];
    this.relatedItems=[];
    this.rdteData.r2data.forEach( r2data => {
      if ( !this.pes.includes( r2data.programElement ) ) {
        this.pes.push(r2data.programElement);
      }
      r2data.items.forEach(item => {
        if ( !this.allItems.includes( item.itemName ) ) {
          this.allItems.push( item.itemName );
        }
      })
    });
    this.pes.sort();
    this.allItems.sort();
  }

  async onPESelected() {
    this.selectedItem=undefined;
    this.r2Data = this.rdteData.r2data.find( r2data => r2data.programElement == this.selectedPE );
    this.items=[];
    this.r2Data.items.forEach( item => this.items.push(item.itemName) );
    this.items.sort();
    if ( !this.itemTags ) { this.itemTags = await this.tagsService.tags(TagType.ITEM).toPromise(); }
  }

  onItemSelected() {
    this.relatedItem="";
    this.relatedItems=[];
    this.item = this.r2Data.items.find( data => data.itemName === this.selectedItem );
    this.item.relatedItems.forEach( i => this.relatedItems.push(i) );
    this.relatedItems.sort();
  }

  onRelatedItemSelected() {
    if ( !this.relatedItems.includes( this.relatedItem ) ) {
      this.relatedItems.push(this.relatedItem);
      this.relatedItems.sort();
      this.item.relatedItems=this.relatedItems;
    }
  }

  removeRelated( removeitem:string ) {
    this.relatedItems = this.relatedItems.filter( i => i != removeitem );
    this.item.relatedItems=this.relatedItems;
  }

  getItemDescription( item:string) : string {
    let tagg:Tag = this.itemTags.find( tag => tag.abbr===item );
    return ( tagg ? tagg.name : "" );
  }

}
