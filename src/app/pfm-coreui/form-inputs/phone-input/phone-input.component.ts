import { Component, OnInit, Input, ViewChild } from '@angular/core';
import { RadioButtonWrapperComponent } from '../radio-button-wrapper/radio-button-wrapper.component';
import { TextInputComponent } from '../text-input/text-input.component';

@Component({
  selector: 'pfm-phone-input',
  templateUrl: './phone-input.component.html',
  styleUrls: ['./phone-input.component.scss']
})
export class PhoneInputComponent implements OnInit {
  @ViewChild(TextInputComponent) textInput: TextInputComponent;
  @Input() id:string;
  @Input() dataModel:any;
  @Input() fieldName:string;
  @Input() label:string = "Phone Number";
  @Input() disabled:boolean;
  @Input() required:boolean;
  @Input() isCellRenderer:boolean;
  maxSize:number = 15;

  phoneRegex = /^[0-9()-]+$/;
  isValidFlag:boolean;
  errorMessage:string;

  constructor() {}

  ngOnInit() {
  }

  //If the input is enabled, check if it is empty. If it is not empty, return true
  isValid(): boolean{
    this.isValidFlag = this.textInput.isValid();
    this.errorMessage = undefined;

    if(this.isValidFlag && this.dataModel && this.dataModel[this.fieldName]){
      if(this.phoneRegex.test(this.dataModel[this.fieldName].search())){
        this.isValidFlag = false;
        this.errorMessage = "Please enter a valid phone number";
      }
    }

    return this.isValidFlag;
  }


}

