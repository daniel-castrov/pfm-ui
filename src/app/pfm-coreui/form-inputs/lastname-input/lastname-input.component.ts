import { Component, OnInit, ViewChild, Input } from '@angular/core';
import { InputWrapperComponent } from '../input-wrapper/input-wrapper.component';

@Component({
  selector: 'pfm-lastname-input',
  templateUrl: './lastname-input.component.html',
  styleUrls: ['./lastname-input.component.scss']
})
export class LastnameInputComponent implements OnInit {

  @ViewChild(InputWrapperComponent,  {static: false}) inputComponent: InputWrapperComponent;

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
          this.errorMessage = "Last name cannot be longer than 30 characters"
      }


      return this.isValidFlag;
  }

}

