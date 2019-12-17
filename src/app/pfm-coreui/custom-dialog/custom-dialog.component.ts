import { Component, Input, OnInit, TemplateRef } from '@angular/core';

@Component({
  selector: 'pfm-custom-dialog',
  templateUrl: './custom-dialog.component.html',
  styleUrls: ['./custom-dialog.component.scss']
})
export class CustomDialogComponent implements OnInit {

  @Input() templateRef:TemplateRef<any>;

  constructor() { }

  ngOnInit() {
  }

}
