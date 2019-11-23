import {Component, Input, OnInit, ViewChild} from '@angular/core';
import { ValidatedComponent } from '../../models/validated-component';
import { TextInputComponent } from '../text-input/text-input.component';

@Component({
  selector: 'pfm-zipcode-input',
  templateUrl: './zipcode-input.component.html',
  styleUrls: ['./zipcode-input.component.scss']
})
export class ZipcodeInputComponent implements OnInit, ValidatedComponent{
  @ViewChild(TextInputComponent, {static: false}) textInput: TextInputComponent;
  @Input() id:string;
  @Input() dataModel:any;
  @Input() fieldName:string;
  @Input() label:string = "Zip Code";
  @Input() disabled:boolean;
  @Input() required:boolean;
  @Input() isCellRenderer:boolean;
  maxSize:number = 6;

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
      if(this.dataModel[this.fieldName].indexOf('a') !== -1){//TODO use a reg ex to only allow numbers
        this.isValidFlag = false;
        this.errorMessage = "Please enter a valid zip code";
      }
    }

    return this.isValidFlag;
  }
}
