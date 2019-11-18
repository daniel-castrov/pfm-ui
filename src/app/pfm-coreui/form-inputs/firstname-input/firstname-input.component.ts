import { Component, OnInit, ViewChild, Input } from '@angular/core';
import { InputWrapperComponent } from '../input-wrapper/input-wrapper.component';

@Component({
  selector: 'pfm-firstname-input',
  templateUrl: './firstname-input.component.html',
  styleUrls: ['./firstname-input.component.scss']
})
export class FirstnameInputComponent implements OnInit {

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
          this.errorMessage = "First name cannot be more than 100 characters"
          this.isValidFlag = false;
      }
      return this.isValidFlag;
  }

}


