import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
declare const $: any;

@Component({
  selector: 'toggle-button',
  templateUrl: './toggle.component.html',
  styleUrls: ['./toggle.component.scss']
})

export class ToggleComponent implements OnInit {

  @Output() onChangeEvent: EventEmitter<boolean>=new EventEmitter();
  @Input() offText: string;
  @Input() onText: string;
  @Input() value: boolean
  @Input() includeHandleStatus: boolean;

  constructor() { }

  ngOnInit() {
    if (this.value) {
      $('#toggle-button').addClass('active');
    } else {
      $('#toggle-button').removeClass('active');
    }
  }

  onChange(){
    this.value = !this.value;
    this.onChangeEvent.emit(this.value);
  }
}
