import { Component, OnInit, Input, EventEmitter, Output } from '@angular/core';

@Component({
  selector: 'pfm-secondary-button-wrapper',
  templateUrl: './secondary-button-wrapper.component.html',
  styleUrls: ['./secondary-button-wrapper.component.scss']
})
export class SecondaryButtonWrapperComponent implements OnInit {

  @Input() dataModel:any;
  @Input() id:string;
  @Input() fieldName:string;
  @Input() inputLabel:string;
  @Input() enabled:boolean = true;
  @Input() errorMessage:string;
  @Input() dropdownOptions:Array<any>;
  @Output() public output = new EventEmitter<MouseEvent>();

  isValidFlag:boolean;

  constructor() {}
  
    ngOnInit() {
    }

    //If the input is enabled, check if it is empty. If it is not empty, return true
    isValid(): boolean{
        this.isValidFlag = true;
        return this.isValidFlag;
    }

  errorExists(){
    return (this.errorMessage == undefined ? false : true );
  }

  handleClick(event: MouseEvent){
    this.output.emit(event);
  }

}