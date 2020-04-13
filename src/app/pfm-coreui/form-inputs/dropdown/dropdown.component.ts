import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { ValidatedComponent } from '../../models/validated-component';
import { ListItem } from '../../../pfm-common-models/ListItem';

@Component({
  selector: 'pfm-dropdown',
  templateUrl: './dropdown.component.html',
  styleUrls: ['./dropdown.component.scss']
})
export class DropdownComponent implements ValidatedComponent, OnInit {
  @Input() id: string; // id and name of the select element
  @Input() disabled: boolean;
  @Input() label: string;
  @Input() required: boolean;
  @Input() fieldName: string;
  @Input() fieldLabel: string;
  @Input() options: ListItem[];
  @Input() prompt = 'Please select';
  @Input() type = 'labelDropdown'; // default
  @Input() iconName: string;
  @Input() title: string;
  @Input() attachmentsDisabled: boolean;
  @Input() defaultOption: ListItem;
  @Output() selectionChanged = new EventEmitter<any>();

  selectedItem: string;

  isValidFlag: boolean;
  errorMessage: string;

  constructor() {}

  handleSelectionChanged(selectedItem): void {
    this.selectedItem = selectedItem;
    const item: any = this.updateIsChecked();
    setTimeout(() => {
      this.selectionChanged.emit(item);
      if (this.type === 'attatchmentDropdown') {
        this.selectedItem = this.prompt;
      }
    });
  }

  isValid(): boolean {
    this.isValidFlag = true;
    this.errorMessage = undefined;

    if (this.required && (!this.selectedItem || this.selectedItem === this.prompt)) {
      this.isValidFlag = false;
      this.errorMessage = 'Please select an option from the drop-down';
    }

    return this.isValidFlag;
  }

  errorExists(): boolean {
    return this.errorMessage === undefined ? false : true;
  }

  ngOnInit() {
    if (this.options && this.fieldName) {
      for (const option of this.options) {
        if (option.isSelected) {
          this.selectedItem = option[this.fieldName];
        }
      }
      if (!this.selectedItem) {
        if (this.defaultOption) {
          this.selectedItem = this.defaultOption[this.fieldName];
        } else {
          this.selectedItem = this.prompt;
        }
      }
    }
  }

  private updateIsChecked(): any {
    let item: any;
    for (const option of this.options) {
      option.isSelected = this.selectedItem === option[this.fieldName];
      if (option.isSelected) {
        item = option;
      }
    }
    return item;
  }
}
