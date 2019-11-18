import { Component, OnInit, ViewChild, Input } from '@angular/core';
import { InputWrapperComponent } from '../input-wrapper/input-wrapper.component';

@Component({
  selector: 'pfm-email-input',
  templateUrl: './email-input.component.html',
  styleUrls: ['./email-input.component.scss']
})
export class EmailInputComponent implements OnInit {

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

      if(this.dataModel[this.fieldName] && this.dataModel[this.fieldName].length > 100){
          this.isValidFlag = false;
          this.errorMessage = "Email cannot be longer than 100 characters"
      }


      return this.isValidFlag;
  }

}
