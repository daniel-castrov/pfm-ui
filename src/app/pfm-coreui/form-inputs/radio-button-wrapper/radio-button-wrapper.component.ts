import { Component, OnInit, Input } from '@angular/core';
import { ValidatedComponent } from '../../models/validated-component';

@Component({
  selector: 'pfm-radio-button-wrapper',
  templateUrl: './radio-button-wrapper.component.html',
  styleUrls: ['./radio-button-wrapper.component.scss']
})
export class RadioButtonWrapperComponent implements OnInit, ValidatedComponent {
  @Input() dataModel: any;
  @Input() id: string;
  @Input() fieldName: string;
  @Input() inputLabel: string;
  @Input() enabled = true;
  @Input() errorMessage: string;
  @Input() radioOptions: Array<any>;

  isValidFlag: boolean;

  constructor() {}

  ngOnInit() {}

  // If the input is enabled, check if it is empty. If it is not empty, return true
  isValid(): boolean {
    this.isValidFlag = true;

    if (
      !this.dataModel[this.fieldName] ||
      this.dataModel[this.fieldName].length === 0 ||
      this.radioOptions.length === 0
    ) {
      this.isValidFlag = false;
    }

    return this.isValidFlag;
  }

  errorExists() {
    return this.errorMessage === undefined ? false : true;
  }
}
