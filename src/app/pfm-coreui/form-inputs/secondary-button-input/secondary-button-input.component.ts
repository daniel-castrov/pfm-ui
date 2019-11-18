import { Component, OnInit, ViewChild, Input, EventEmitter, Output } from '@angular/core';
import { SecondaryButtonWrapperComponent } from '../secondary-button-wrapper/secondary-button-wrapper.component';

@Component({
  selector: 'pfm-secondary-button-input',
  templateUrl: './secondary-button-input.component.html',
  styleUrls: ['./secondary-button-input.component.scss']
})
export class SecondaryButtonInputComponent implements OnInit {

  @ViewChild(SecondaryButtonWrapperComponent, {static: false}) inputComponent: SecondaryButtonWrapperComponent;

  @Input() dataModel:any;
  @Input() id:string;
  @Input() fieldName:string;
  @Input() inputLabel:string;
  @Input() enabled:boolean = true;
  @Output() public output = new EventEmitter<MouseEvent>();  

  isValidFlag:boolean;
  errorMessage:string;

  constructor() { }

  ngOnInit() {
  }

  isValid(): boolean {
    this.isValidFlag = this.inputComponent.isValid();
    this.errorMessage = "";
    return this.isValidFlag;
  }
  
  handleClick(event: MouseEvent){
    this.output.emit(event);
  }
}
