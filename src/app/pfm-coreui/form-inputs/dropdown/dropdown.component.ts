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
  @Output() onSelectionChanged:EventEmitter<string> = new EventEmitter<string>();

  selectedItem:string;

  isValidFlag:boolean;
  errorMessage: string;

  constructor() { }

  handleSelectionChanged():void{
    setTimeout(()=>{
      this.onSelectionChanged.emit(this.selectedItem);
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

  }

}
