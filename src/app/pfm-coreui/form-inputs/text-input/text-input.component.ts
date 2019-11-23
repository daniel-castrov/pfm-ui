import { Component, OnInit, Input, Output, EventEmitter, ViewChild, ViewContainerRef, AfterViewInit } from '@angular/core';
import { ValidatedComponent } from '../../models/validated-component';

@Component({
  selector: 'pfm-text-input',
  templateUrl: './text-input.component.html',
  styleUrls: ['./text-input.component.scss']
})
export class TextInputComponent implements OnInit, ValidatedComponent {
  @ViewChild('input', {read: ViewContainerRef, static: false}) public input;
  @Input() id:string;
  @Input() type:string = "text";//email/password/number/etc..
  @Input() dataModel:any;
  @Input() fieldName:string;
  @Input() label:string;
  @Input() disabled:boolean;
  @Input() required:boolean;
  @Input() maxSize:number = 250;
  @Input() isCellRenderer:boolean;
  @Input() isReadOnly:boolean;
  @Input() errorMessage:string;
  @Output() onValueChanged:EventEmitter<string> = new EventEmitter<string>();

  errorMessageInternal:string;
  isValidFlag:boolean;

  constructor() {}

    ngOnInit() {
    }

    handleChange(event:any):void{
      this.onValueChanged.emit(event);
    }

    //If the input is enabled, check if it is empty. If it is not empty, return true
    isValid(): boolean{
        this.isValidFlag = true;
        this.errorMessageInternal = undefined;

        if(this.required){
          if(!this.dataModel[this.fieldName] || this.dataModel[this.fieldName].length == 0){
            this.isValidFlag = false;
            this.errorMessageInternal = "Please enter a value.";
          }
        }

        if(this.isValidFlag && this.dataModel && this.dataModel[this.fieldName] && this.dataModel[this.fieldName].length > this.maxSize){
          this.isValidFlag = false;
          this.errorMessageInternal = "Value must be less than " + this.maxSize;
        }

        return this.isValidFlag;
  }

  getErroMessage():string{
    if(this.errorMessageInternal !== undefined){
      return this.errorMessageInternal;
    }
    if(this.errorMessage){
      return this.errorMessage;
    }
    return undefined;
  }

  setFocus() {
    setTimeout(() => {
        this.input.element.nativeElement.focus();
    })
  }

}
