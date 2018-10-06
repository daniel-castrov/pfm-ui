import {Component, EventEmitter, Output} from '@angular/core';

@Component({
  selector: 'import',
  templateUrl: './import.component.html',
  styleUrls: ['./import.component.scss']
})
export class ImportComponent {
  @Output() emitter = new EventEmitter();

}
