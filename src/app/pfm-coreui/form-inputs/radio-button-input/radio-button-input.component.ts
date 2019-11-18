import { Component, OnInit, ViewChild, Input } from '@angular/core';
import { RadioButtonWrapperComponent } from '../radio-button-wrapper/radio-button-wrapper.component';

@Component({
  selector: 'pfm-radio-button-input',
  templateUrl: './radio-button-input.component.html',
  styleUrls: ['./radio-button-input.component.scss']
})
export class RadioButtonInputComponent implements OnInit {

  @ViewChild(RadioButtonWrapperComponent, {static: false}) inputComponent: RadioButtonWrapperComponent;

  @Input() dataModel:any;
  @Input() id:string;
  @Input() fieldName:string;
  @Input() enabled:boolean = true;
  @Input() inputLabel:string;
  @Input() radioOptions:Array<any>;

  errorMessage: string;
  isValidFlag:boolean;

  constructor() { }

  ngOnInit() {
  }

  isValid(): boolean {

      this.isValidFlag = this.inputComponent.isValid();
      this.errorMessage = "";

      if(!this.dataModel[this.fieldName]){
          this.isValidFlag = false;
          this.errorMessage = "Please select an option from the radio buttons"
      }


      return this.isValidFlag;
  }

}
