import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'pfm-toggle-input',
  templateUrl: './toggle-input.component.html',
  styleUrls: ['./toggle-input.component.scss']
})
export class ToggleInputComponent implements OnInit {
  @Input() label: string;
  @Input() onOffLabel: string;
  @Input() checked: boolean;
  @Input() activeClass = 'primary';
  @Output() valueChanged = new EventEmitter<boolean>();

  constructor() {}

  ngOnInit() {}

  onChange(value: any) {
    this.valueChanged.emit(value);
  }
}
