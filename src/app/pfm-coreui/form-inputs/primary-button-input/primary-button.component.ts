import { Component, EventEmitter, Output, Input } from '@angular/core';

@Component({
  selector: 'pfm-primary-button',
  templateUrl: './primary-button.component.html',
  styleUrls: ['./primary-button.component.scss']
})
export class PrimaryButtonComponent {
  @Input() id: string;
  @Input() label = 'Primary';
  @Input() name = 'primary';
  @Input() disabled: boolean;

  @Output() onClick = new EventEmitter<MouseEvent>();

  constructor() {}

  handleClick(event: MouseEvent) {
    this.onClick.emit(event);
  }
}
