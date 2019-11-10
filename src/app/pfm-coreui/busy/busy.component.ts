import {Component, Input} from '@angular/core';

@Component({
  selector: 'pfm-busy',
  templateUrl: 'busy.component.html',
  styleUrls: ['busy.component.css'],
})
export class BusyComponent {

  @Input() busy:boolean;

}
