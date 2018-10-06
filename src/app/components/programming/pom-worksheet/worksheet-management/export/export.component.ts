import {Component, EventEmitter, Output} from '@angular/core';

@Component({
  selector: 'export',
  templateUrl: './export.component.html',
  styleUrls: ['./export.component.scss']
})
export class ExportComponent {
  @Output() emitter = new EventEmitter();

}
