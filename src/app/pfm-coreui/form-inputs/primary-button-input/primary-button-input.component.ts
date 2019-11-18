import { Component, OnInit, EventEmitter, Output, ViewChild, Input } from '@angular/core';
import { PrimaryButtonWrapperComponent } from '../primary-button-wrapper/primary-button-wrapper.component';

@Component({
  selector: 'pfm-primary-button-input',
  templateUrl: './primary-button-input.component.html',
  styleUrls: ['./primary-button-input.component.scss']
})
export class PrimaryButtonInputComponent implements OnInit {
  
  @ViewChild(PrimaryButtonWrapperComponent, {static: false}) inputComponent: PrimaryButtonWrapperComponent;

  @Input() dataModel:any;
  @Input() id:string;
  @Input() inputLabel:string;
  @Input() fieldName:string;
  @Input() buttonName:string;
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

