import { Component, OnInit, ViewChild, Input } from '@angular/core';
import { InputWrapperComponent } from '../input-wrapper/input-wrapper.component';

@Component({
  selector: 'pfm-username-input',
  templateUrl: './username-input.component.html',
  styleUrls: ['./username-input.component.scss']
})
export class UsernameInputComponent implements OnInit {

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

      if(this.dataModel[this.fieldName] && this.dataModel[this.fieldName].length > 30){
          this.isValidFlag = false;
          this.errorMessage = "Username cannot be longer than 30 characters"
      }


      return this.isValidFlag;
  }

}
