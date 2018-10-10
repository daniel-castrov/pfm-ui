import {EventEmitter, Input, OnChanges, Output} from '@angular/core';
import {Worksheet} from "../../../../generated";

export class BaseComponent implements OnChanges {
  @Input() selectedWorksheet: Worksheet;
  @Output() operationOver = new EventEmitter();

  name: string;
  version: number;

  ngOnChanges() {
    this.name = this.selectedWorksheet && this.selectedWorksheet.name;
    this.version = this.selectedWorksheet && this.selectedWorksheet.version;
  }

}
