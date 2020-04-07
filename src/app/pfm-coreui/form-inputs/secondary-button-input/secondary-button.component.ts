import { Component, ViewChild, Input, EventEmitter, Output } from '@angular/core';

@Component( {
  selector: 'pfm-secondary-button',
  templateUrl: './secondary-button.component.html',
  styleUrls: [ './secondary-button.component.scss' ]
} )
export class SecondaryButtonComponent {

  @Input() id: string;
  @Input() label = 'Secondary';
  @Input() icon: string;
  @Input() name = 'secondary';
  @Input() disabled: boolean;

  @Output() click = new EventEmitter<MouseEvent>();

  @ViewChild('buttonElement') buttonElement;

  constructor() {
  }

  handleClick( event: MouseEvent ) {
    this.click.emit( event );
  }

  blur() {
    this.buttonElement.nativeElement.blur();
  }
}
