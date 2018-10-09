import {Component, EventEmitter, Input, Output} from '@angular/core';
import {Worksheet} from "../../../../../generated";

@Component({
  selector: 'duplicate',
  templateUrl: './duplicate.component.html',
  styleUrls: ['./duplicate.component.scss']
})
export class DuplicateComponent {
  @Input() selectedWorksheet: Worksheet;
  @Output() operationOver = new EventEmitter();

}
