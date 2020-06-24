import { Component, OnInit, Input, Output, EventEmitter, HostBinding } from '@angular/core';
import { ValidatedComponent } from '../../models/validated-component';
import { ListItem } from '../../../pfm-common-models/ListItem';

@Component({
  selector: 'pfm-dropdown',
  templateUrl: './dropdown.component.html',
  styleUrls: ['./dropdown.component.scss']
})
export class DropdownComponent implements ValidatedComponent, OnInit {
  @Input() disabled = false;
  @Input() label: string;
  @Input() required: boolean;
  @Input() fieldName: string;
  @Input() fieldLabel: string;
  @Input() options: ListItem[];
  @Input() prompt = 'Select';
  @Input() type = 'labelDropdown'; // default
  @Input() iconName: string;
  @Input() title: string;
  @Input() defaultOption: ListItem;
  @Input() showPrompt = true;
  @Input() promptValue = 'Select';
  @Input() disablePrompt = true;
  @Input() visible = true;
  @Output() selectionChanged = new EventEmitter<any>();

  selectedItem: string;

  isValidFlag: boolean;
  errorMessage: string;

  @HostBinding('class.disabled') get class() {
    return this.disabled;
  }

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
          if (!this.showPrompt) {
            this.selectedItem = this.options[0][this.fieldName];
          } else {
            this.selectedItem = this.promptValue;
          }
        }
      }
    }
  }

  private updateIsChecked(): any {
    let item: any;
    if (this.selectedItem === this.promptValue) {
      return { name: this.prompt, value: this.selectedItem, rawData: this.selectedItem, isSelected: true };
    }
    for (const option of this.options) {
      option.isSelected = this.selectedItem === option[this.fieldName];
      if (option.isSelected) {
        item = option;
      }
    }
    return item;
  }
}
