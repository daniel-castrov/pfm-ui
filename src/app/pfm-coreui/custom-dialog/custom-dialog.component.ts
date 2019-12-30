import { Component, Input, Output, OnInit, TemplateRef, EventEmitter } from '@angular/core';

@Component({
  selector: 'pfm-custom-dialog',
  templateUrl: './custom-dialog.component.html',
  styleUrls: ['./custom-dialog.component.scss']
})
export class CustomDialogComponent implements OnInit {

  @Input() title:string;
  @Input() body:TemplateRef<any>;
  @Input() actions:TemplateRef<any>;
  @Input() templateRef:TemplateRef<any>;
  @Output() onCancelDialog:EventEmitter<any> = new EventEmitter<any>();

  constructor() { }

  ngOnInit() {
  }

  cancel() {
    this.onCancelDialog.emit();
  }
}
