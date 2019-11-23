import { Component, OnInit, ViewChild, Input } from '@angular/core';
import { TextInputComponent } from '../text-input/text-input.component';

@Component({
  selector: 'pfm-password-input',
  templateUrl: './password-input.component.html',
  styleUrls: ['./password-input.component.scss']
})
export class PasswordInputComponent implements OnInit {
  @ViewChild(TextInputComponent, {static: false}) textInput: TextInputComponent;
  @Input() id:string;
  @Input() dataModel:any;
  @Input() fieldName:string;
  @Input() label:string = "Password";
  @Input() disabled:boolean;
  @Input() required:boolean;
  @Input() isCellRenderer:boolean;
  maxSize:number = 250;

  isValidFlag:boolean;
  errorMessage:string;

  constructor() {}

  ngOnInit() {
  }

  //If the input is enabled, check if it is empty. If it is not empty, return true
  isValid(): boolean{
    this.isValidFlag = this.textInput.isValid();
    this.errorMessage = undefined;

    return this.isValidFlag;
  }

  errorExists(){
    return (this.errorMessage == undefined ? false : true );
  }

}
