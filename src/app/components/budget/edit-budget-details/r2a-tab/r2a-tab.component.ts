import { Component, OnChanges, Input } from '@angular/core';
import { RdteData, R2AData, Tag } from '../../../../generated';
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
  r2adata : R2AData;
  allItems: string[];
  relatedItems: string[];
  relatedItem: string="";
  itemTags: Tag[];

  cleardata(){
    this.r2adata={};
    this.selectedPE=null;
    this.selectedItem=null;
  }

  constructor(
    private tagsService: TagsService
  ) { }

  ngOnChanges() {
    if (this.rdteData && this.rdteData.r2Adata){
      this.init();
    }
  }

  async init(){
    this.pes=[];
    this.allItems=[];
    this.relatedItems=[];
    this.rdteData.r2Adata.forEach( r2a => { 
      if ( !this.pes.includes( r2a.programElement ) ){ 
        this.pes.push(r2a.programElement);
      }
      if ( ! this.allItems.includes( r2a.item ) ){
        this.allItems.push( r2a.item );
      }
    });
    this.pes.sort();
    this.allItems.sort();
  }

  async onPESelected(){
    this.selectedItem=null;
    let listR2a = this.rdteData.r2Adata.filter( d => d.programElement == this.selectedPE );
    this.items=[];
    listR2a.forEach( dd => this.items.push(dd.item) );
    this.items.sort();
    if ( !this.itemTags ) { this.itemTags = await this.tagsService.tags(TagType.ITEM).toPromise(); }
  }

  onItemSelected(){
    this.relatedItem="";
    this.relatedItems=[];
    this.r2adata = this.rdteData.r2Adata.find( data => data.item === this.selectedItem );
    this.r2adata.relatedItems.forEach( i => this.relatedItems.push(i) );
    this.relatedItems.sort();
  }

  onRelatedItemSelected(){
    if ( !this.relatedItems.includes( this.relatedItem ) ) {
      this.relatedItems.push(this.relatedItem);
      this.relatedItems.sort();
      this.r2adata.relatedItems=this.relatedItems;
    }
  }

  removeRelated( removeitem:string ){
    this.relatedItems = this.relatedItems.filter( i => i != removeitem );
    this.r2adata.relatedItems=this.relatedItems;
  }

  getItemDescription( item:string) : string {
    return this.itemTags.find( tag => tag.abbr===item ).name ;
  }

}
