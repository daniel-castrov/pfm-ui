import {Component, EventEmitter, Input, Output} from '@angular/core';
import {Worksheet} from "../../../../../generated";

@Component({
  selector: 'rename',
  templateUrl: './rename.component.html',
  styleUrls: ['./rename.component.scss']
})
export class RenameComponent {
  @Input() selectedWorksheet: Worksheet;
  @Output() operationOver = new EventEmitter();

}
