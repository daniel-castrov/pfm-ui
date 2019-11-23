import { Component, OnInit, ViewChild, Input, EventEmitter, Output } from '@angular/core';

@Component({
  selector: 'pfm-secondary-button',
  templateUrl: './secondary-button.component.html',
  styleUrls: ['./secondary-button.component.scss']
})
export class SecondaryButtonComponent {

  @Input() id:string;
  @Input() label:string = "Secondary";
  @Input() name:string = "secondary";
  @Input() disabled:boolean;

  @Output() onClick = new EventEmitter<MouseEvent>();

  constructor() { }

  handleClick(event: MouseEvent){
    this.onClick.emit(event);
  }
}
