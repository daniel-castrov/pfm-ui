import {Component, Input, OnInit, ViewChild} from '@angular/core';
import {InputWrapperComponent} from '../input-wrapper/input-wrapper.component';
import { ValidatedComponent } from '../../models/validated-component';

@Component({
  selector: 'pfm-zipcode-input',
  templateUrl: './zipcode-input.component.html',
  styleUrls: ['./zipcode-input.component.scss']
})
export class ZipcodeInputComponent implements OnInit, ValidatedComponent{

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

        if(this.dataModel[this.fieldName] && this.dataModel[this.fieldName].length !== 5){
            this.isValidFlag = false;
            this.errorMessage = "The zip code must be 5 digits"
        }


        return this.isValidFlag;
    }

}
