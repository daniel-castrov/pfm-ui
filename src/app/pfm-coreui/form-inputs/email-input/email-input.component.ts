import { Component, OnInit, ViewChild, Input } from '@angular/core';
import { TextInputComponent } from '../text-input/text-input.component';

@Component({
  selector: 'pfm-email-input',
  templateUrl: './email-input.component.html',
  styleUrls: ['./email-input.component.scss']
})
export class EmailInputComponent implements OnInit {
  @ViewChild(TextInputComponent) textInput: TextInputComponent;
  @Input() id: string;
  @Input() dataModel: any;
  @Input() fieldName: string;
  @Input() label: string = 'Email';
  @Input() disabled: boolean;
  @Input() required: boolean;
  @Input() isCellRenderer: boolean;
  maxSize: number = 250;

  isValidFlag: boolean;
  errorMessage: string;

  constructor() {}

  ngOnInit() {}

  // If the input is enabled, check if it is empty. If it is not empty, return true
  isValid(): boolean {
    this.isValidFlag = this.textInput.isValid();
    this.errorMessage = undefined;

    if (this.isValidFlag && this.dataModel && this.dataModel[this.fieldName]) {
      if (this.dataModel[this.fieldName].indexOf('@') === -1) {
        // TODO - add in more rules/regex to verify it is a valid email address
        this.isValidFlag = true;
        this.errorMessage = 'Value is not a valid email';
      }
    }

    return this.isValidFlag;
  }

  errorExists() {
    return this.errorMessage === undefined ? false : true;
  }
}
