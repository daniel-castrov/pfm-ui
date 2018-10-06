import {Component, EventEmitter, Output} from '@angular/core';

@Component({
  selector: 'duplicate',
  templateUrl: './duplicate.component.html',
  styleUrls: ['./duplicate.component.scss']
})
export class DuplicateComponent {
  @Output() emitter = new EventEmitter();

}
