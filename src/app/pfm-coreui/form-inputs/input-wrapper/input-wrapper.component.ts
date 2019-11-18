import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { ValidatedComponent } from '../../models/validated-component';

@Component({
  selector: 'pfm-input-wrapper',
  templateUrl: './input-wrapper.component.html',
  styleUrls: ['./input-wrapper.component.scss']
})
export class InputWrapperComponent implements OnInit, ValidatedComponent {

  @Input() dataModel:any;
  @Input() id:string;
  @Input() fieldName:string;
  @Input() inputLabel:string;
  @Input() enabled:boolean = true;
  @Input() errorMessage:string;
  @Input() maxSize:number = 250;

  isValidFlag:boolean;

  constructor() {}


    ngOnInit() {
    }

    //If the input is enabled, check if it is empty. If it is not empty, return true
    isValid(): boolean{
        this.isValidFlag = true;

        if(!this.dataModel[this.fieldName] || this.dataModel[this.fieldName].length == 0){
            this.isValidFlag = false;
        }

        return this.isValidFlag;
  }

  errorExists(){
    return (this.errorMessage == undefined ? false : true );
  }

}
