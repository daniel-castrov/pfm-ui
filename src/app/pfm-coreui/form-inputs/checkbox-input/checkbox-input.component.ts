import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'pfm-checkbox-input',
  templateUrl: './checkbox-input.component.html',
  styleUrls: ['./checkbox-input.component.scss']
})
export class CheckboxInputComponent implements OnInit {
  @Input() id: string;
  @Input() checked: boolean;
  @Input() fieldName: string;
  @Input() label: string;
  @Input() enabled = true;
  @Input() errorMessage: string;
  @Input() showLabel = true;
  @Input() isDisabled: boolean;
  @Output() valueChanged: EventEmitter<boolean> = new EventEmitter<boolean>();

  constructor() {}

  ngOnInit(): void {}

  checkboxChange(event: any): void {
    this.checked = event;
    this.valueChanged.emit(event);
  }
}
