import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';

@Component({
  selector: 'pfm-cancel-cta',
  templateUrl: './cancel-cta.component.html',
  styleUrls: ['./cancel-cta.component.scss']
})
export class CancelCtaComponent implements OnInit {
  @Output() onCancelClicked:EventEmitter<any> = new EventEmitter<any>();

  @Input() disabled:boolean;

  constructor() { }

  handleCancel(){
    if(!this.disabled){
      this.onCancelClicked.emit("cancel");
    }
  }

  ngOnInit() {
  }

}
