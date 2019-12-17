import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { ValidatedComponent } from '../../models/validated-component';

@Component({
  selector: 'pfm-dropdown',
  templateUrl: './dropdown.component.html',
  styleUrls: ['./dropdown.component.scss']
})
export class DropdownComponent implements ValidatedComponent, OnInit {

  @Input() id:string;
  @Input() disabled:boolean;
  @Input() label:string;
  @Input() required:boolean;
  @Input() fieldName:string;
  @Input() fieldLabel:string;
  @Input() options:any[];
  @Input() prompt:string = "Please select";
  @Input() type:string = "labelDropdown";//default
  @Input() iconName:string;
  @Input() title:string;
  @Input() attachmentsDisabled:boolean;
  @Output() onSelectionChanged:EventEmitter<any> = new EventEmitter<any>();

  selectedItem:string;

  isValidFlag:boolean;
  errorMessage: string;

  constructor() { }

  handleSelectionChanged(selectedItem):void{
    this.selectedItem = selectedItem;
    let item:any = this.updateIsChecked();
    setTimeout(()=>{
      this.onSelectionChanged.emit(item);
    });
  }

  isValid(): boolean {
    this.isValidFlag = true;
    this.errorMessage = undefined;

    if(this.required && (!this.selectedItem || this.selectedItem === this.prompt)){
      this.isValidFlag = false;
      this.errorMessage = "Please select an option from the drop-down";
    }

    return this.isValidFlag;
  }

  errorExists():boolean{
    return this.errorMessage == undefined ? false : true;
  }

  ngOnInit(){
    if(this.options && this.fieldName){
      for(let option of this.options){
        if(option.isSelected){
          this.selectedItem = option[this.fieldName];
        }
      }
      if(!this.selectedItem){
        this.selectedItem = this.prompt;
      }
    }
  }

  private updateIsChecked():any{
    let item:any = undefined;
    for(let option of this.options){
      option.isSelected = this.selectedItem == option[this.fieldName];
      if(option.isSelected){
        item = option;
      }
    }
    return item;
  }

}
