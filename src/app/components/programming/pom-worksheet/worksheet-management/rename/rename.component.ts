import {Component, EventEmitter, Output} from '@angular/core';

@Component({
  selector: 'rename',
  templateUrl: './rename.component.html',
  styleUrls: ['./rename.component.scss']
})
export class RenameComponent {
  @Output() operationOver = new EventEmitter();

}
