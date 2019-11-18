import { Component, OnInit, ViewChild, Input } from '@angular/core';
import { InputWrapperComponent } from '../input-wrapper/input-wrapper.component';

@Component({
  selector: 'pfm-password-input',
  templateUrl: './password-input.component.html',
  styleUrls: ['./password-input.component.scss']
})
export class PasswordInputComponent implements OnInit {

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

  isValid(): any {

      this.isValidFlag = this.inputComponent.isValid();
      this.errorMessage = "";

      if(this.dataModel[this.fieldName] && (this.dataModel[this.fieldName].length > 20 || this.dataModel[this.fieldName].length < 8)){
          this.isValidFlag = false;
          this.errorMessage = "The password must be between 8 and 20 characters long"
      }

      return this.isValidFlag;
  }

}
