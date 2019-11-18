import { Component, OnInit, Input, ViewChild } from '@angular/core';
import { InputWrapperComponent } from '../input-wrapper/input-wrapper.component';

@Component({
  selector: 'pfm-phone-input',
  templateUrl: './phone-input.component.html',
  styleUrls: ['./phone-input.component.scss']
})
export class PhoneInputComponent implements OnInit {

  @ViewChild(InputWrapperComponent, {static: false}) inputComponent: InputWrapperComponent;

  @Input() dataModel:any;
  @Input() id:string;
  @Input() fieldName:string;
  @Input() enabled:boolean = true;

  isValidFlag:boolean;
  errorMessage:string;

  constructor() { }

  ngOnInit() {
  }

  isValid(): boolean {

      this.isValidFlag = this.inputComponent.isValid();
      this.errorMessage = "";

      if(this.dataModel[this.fieldName] && (this.dataModel[this.fieldName].length !== 7 && this.dataModel[this.fieldName].length !== 10)){
          this.isValidFlag = false;
          this.errorMessage = "Phone number must be either 7 or 10 digits long"
      }


      return this.isValidFlag;
  }

}

